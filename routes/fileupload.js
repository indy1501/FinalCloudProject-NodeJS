var AWS = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
const express = require("express")
const bodyParser = require('body-parser')
const router = express.Router()
router.use(bodyParser.json())
require('dotenv').config();

var detectedTXT = [];
var comprehendinput = {};
var detectedtxt;
var numberregex = /\d/;
var datereg = /^\d{2}\/\d{2}$/;
var comprehendoutput = {};


let awsConfig = {
  "region": process.env.region,
  "accessKeyId": process.env.accessKeyId, 
  "secretAccessKey": process.env.secretAccessKey
 };
AWS.config.update(awsConfig);
var s3 = new AWS.S3();

const rekognition = new AWS.Rekognition();
const comprehend = new AWS.Comprehend();

var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'cloudstoragebucket1',
      limits: { fileSize: 10*1024*1024 },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: 'testfile'});
      },
      key: function (req, file, cb) {
        cb(null, file.originalname.toString())
      }
    })
});

const singleUpload = upload.single('file');

router.post('/fileupload', function(req, res) {
  singleUpload(req, res, function(err) {
    if (err) {
        console.log(err);
      return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    ccinfo = getCCInfo(req.file.key);
    //console.log(ccinfo);
    //return res.json({'imageUrl' : req.file.location, 'fileName': req.file.key});
    //return res.json(ccinfo);
  });

});

function getCCInfo(filename){

  var params = {
    Image: {
     S3Object: {
      Bucket: "cloudstoragebucket1", 
      Name: filename
     }
    }
   };

  
  //Detect text
  rekognition.detectText(params, function(err, data) {
    if (err) console.log(err);
    else     console.log("detect success");           // successful response
 
   // console.log(data.TextDetections);
    for(var i = 0; i < data.TextDetections.length;i++){
      if(data.TextDetections[i].Type === 'LINE'){
        detectedtxt = data.TextDetections[i].DetectedText;
        if(numberregex.test(detectedtxt) && detectedtxt.length == 19)
        {
          comprehendoutput["CreditCardNumber"] = detectedtxt;
        }
        
      }
      if(data.TextDetections[i].Type === 'WORD'){
        detectedtxt = data.TextDetections[i].DetectedText;
        if(numberregex.test(detectedtxt) && datereg.test(detectedtxt))
        {
          comprehendoutput["ExpiryDate"] = detectedtxt;
        }
      }  
      detectedTXT.push(data.TextDetections[i].DetectedText);    
    } 

    comprehendinput = JSON.stringify(detectedTXT);
    
    var params1 = {
      LanguageCode: "en",
      Text: comprehendinput
    };
    comprehend.detectEntities(params1, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log("comprehend success");           // successful response
      
      for(var i = 0; i < data.Entities.length;i++){
        if(data.Entities[i].Type == "PERSON"){
          comprehendoutput["User"] = data.Entities[i].Text;
        }
        if(data.Entities[i].Type == "ORGANIZATION"){
          comprehendoutput["Organization"] = data.Entities[i].Text;
        }
      }
      console.log(comprehendoutput);
    });

    
  });

}


router.post('/filedelete', function(req, res){
  console.log(req.body);
  var params = {
    Bucket: 'cloudstoragebucket1',
    Key: req.body.fileName
  };
  s3.deleteObject(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(data);
    }
  });
})

module.exports = router;