

// partially from : https://github.com/odysseyscience/react-s3-uploader
exports.getTimeEU = function() {
  var timeNow = new Date();
  var euh = timeNow.getUTCHours() + 2;
  if (euh < 10 ) { euh = "0" + euh; }
  var eum = timeNow.getUTCMinutes();
  if (eum < 10 ) { eum = "0" + eum; }
  return euh + ":" + eum + " CEST";
};
