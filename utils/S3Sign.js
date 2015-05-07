var uuid = require('node-uuid');
var aws = require('aws-sdk');
var mime = require('mime');

var secrets = require('../secrets.js');
aws.config.update({
  accessKeyId: secrets.AWS_ACCESS_KEY_ID,
  secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY
});

exports.sign = function(req, res) {
  var filename = uuid.v4() + "_" + req.body.filename;
  var mimeType = mime.lookup(filename);
  var fileKey = filename;

  var s3 = new aws.S3();
  var params = {
    Bucket: secrets.S3BUCKET_NAME,
    Key: fileKey,
    Expires: 60,
    ContentType: mimeType,
    ACL: 'private'
  };
  s3.getSignedUrl('putObject', params, function(err, data) {
    if (err) {
      console.log(err);
      return res.send(500, "Cannot create S3 signed URL");
    }
    data = data.replace('https://liveblogphotos2.s3.amazonaws.com', 'https://liveblogphotos2.s3-us-west-2.amazonaws.com');
    res.json({
      signedUrl: data,
      publicUrl: filename,
      filename: filename
    });
  });
};


// partially from : https://github.com/odysseyscience/react-s3-uploader
