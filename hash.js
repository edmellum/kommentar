var crypto = require('crypto');

module.exports = function(input) {
  var shasum = crypto.createHash('sha256');
  shasum.update(input);
  var hash = shasum.digest('base64');
  return encodeURIComponent(hash);
};
