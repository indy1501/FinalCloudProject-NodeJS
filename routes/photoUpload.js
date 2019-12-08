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
const parseResult = dotenv.config({path:'/home/ubuntu/.env'})
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

const rekognition = new AWS.Rekognition({
  apiVersion: '2016-06-27',
  region: "us-west-1",
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
  console.log(req.body);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  /* console.log(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_ACCESS_KEY) */

  console.log("tempFilePath:" + req.files.inputFile.tempFilePath)
  console.log("EventId:" + req.body.eventId)

  const fileContent = fs.createReadStream(req.files.inputFile.tempFilePath);
  console.log("mimetype: " + req.files.inputFile.mimetype)
  // Setting up S3 upload parameters
  const params = {
    Bucket: "cloudhwbucket1/" + req.body.eventId,
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

router.get('/getFaceComparison', function (req, res) {
  console.log("tempFileName " + req.query.tempFileName);
  console.log("eventId " + req.query.eventId);


  if (!req.query.eventId) {
    return res.status(400).send(`Event ID is required`)
  }
  if (!req.query.tempFileName) {
    return res.status(400).send(`tempFileName is required`)
  }

  const params = {
    Bucket: "cloudhwbucket1",
    Prefix: req.query.eventId,
  };

  s3.listObjects(params, function (err, data) {
    if (err) {
      console.log("err in list objects:", err);
      return res.status(500).send(`List S3 Failed ${err}`);
    }

    var matched = false;
    const tempImage = "temp/"+req.query.tempFileName;

    data.Contents.forEach(
      obj => {
        console.log(obj);

        compareImages(tempImage, obj.Key, (result)=> {
        console.log("Compared : ",tempImage, "with ",obj.Key, "result:"+result)
        if (result) {
          matched = true;
          deleteS3image(tempImage)
          return res.status(200).send("matched");
        } 
       });
      }
    );

    setTimeout(()=> {
      if(!matched) {
        deleteS3image(tempImage)
        return res.status(403).send("unmatched");
      }
    }, 5000);

  });

});

function compareImages(image1, image2, callBackFunc) {
  var params = {
    SimilarityThreshold: 90,
    SourceImage: {
      S3Object: {
        Bucket: "cloudhwbucket1",
        Name: image1
      }
    },
    TargetImage: {
      S3Object: {
        Bucket: "cloudhwbucket1",
        Name: image2
      }
    }
  };
  rekognition.compareFaces(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
      callBackFunc(false);
    } else {
      console.log("Comparing : ",image1, image2 , data);
      
      if (data.FaceMatches && data.FaceMatches.length >0 ) {
        const result = data.FaceMatches[0];
        
        if (result.Similarity >= 90.0) {
          console.log("Similarity:", result.Similarity);
          callBackFunc(true);
        } 
      } else {
        callBackFunc(false);
      }
    }
  });


}

function deleteS3image(image1){
    /* console.log("REQUEST param ", req.body); */
    if (!image1) {
      return 0;
    }
  
    const fileDeletePath = image1
    //const userId = req.body.userId
    // Setting up S3 delete parameters
    const params = {
      Bucket: "cloudhwbucket1",
      Key: fileDeletePath
    };
    // Deleting files to the bucket
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log("Error in deleting file", err);
        return 0;
      } else {
        console.log(`File deleted successfully: ${fileDeletePath}`);
        return 1;
      }
  
    });
}

module.exports = router;