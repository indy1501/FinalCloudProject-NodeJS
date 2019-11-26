const express = require('express')
const fileUpload = require('express-fileupload');
let cors = require('cors');
const port = 3001
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const router = new express.Router();
const uuid = require('uuidv4').default;
const dotenv = require('dotenv');
const parseResult = dotenv.config()
if (parseResult.error) {
  throw parseResult.error
}

console.log(parseResult.parsed)
router.use(express.json())
router.use(cors())
router.use(express.urlencoded({ extended: true }))

router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: 'tmp'
}));

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});



function deleteFileTemp(path) {
    try {
      fs.unlinkSync(path)
      //file removed
    } catch (err) {
      console.error("Error in deleting temp file " + path, err);
    }
  }
  
  router.post('/upload_photo', function (req, res) {
    console.log(req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    console.log(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_ACCESS_KEY)
  
    console.log("tempFilePath:" + req.files.inputFile.tempFilePath)
    const fileContent = fs.createReadStream(req.files.inputFile.tempFilePath);
    console.log("mimetype: " + req.files.inputFile.mimetype)
    // Setting up S3 upload parameters
    const params = {
      Bucket: "cloudhwbucket1/Images1",
      Key: req.files.inputFile.name,
      ContentType: req.files.inputFile.mimetype,
      Body: fileContent
    };
  
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        console.log("Error in uploading file", err);
        return res.status(500).send(`Can not upload the file. ${err}`)
        // Send 500 Response 
      } else {
        deleteFileTemp(req.files.inputFile.tempFilePath);
        console.log(`File uploaded successfully. ${data.Location}`);
        return res.status(200).send(`File uploaded successfully. ${data.Location}`)
      }
    });
});
module.exports = router;