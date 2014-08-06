var request = require('superagent');
var inspect = require('util').inspect;
var _       = require('underscore');

function Validator(ignore, opts) {
  this.ignore = ignore || [];
  this.opts = opts || {};
}

/**
 * Validates a string of HTML with the W3C validator
 *
 * @param {String} buffer      The string to validate
 * @param {Function} callback  fn(err, data)
 */
Validator.prototype.validate = function (buffer, callback) {
  var self   = this;

  if (!buffer) {
    return callback(new Error('buffer must be a non-empty string of HTML markup to validate'), null);
  }

  var req = request.post(self.opts.url || 'http://validator.w3.org/check');
  req.set('User-Agent', 'w3c-validate - npm module');
  req.field('uploaded_file', buffer);
  req.field('charset', 'utf-8')
  req.field('output', 'json');
  req.end(function (err, res) {
    if (err) {
      return callback(err, null);
    }

    // expect 200 OK
    if(res.status!==200) {
      return callback(new Error('Server responded with status '+res.status+'.'), null);
    }

    // expect results in json format as defined in var output
    if(res.type!=='application/json') {
      return callback(new Error('Invalid response type "'+res.type+'" from the server. Check the URL.'), null);
    }

    function keepError (msg) {
      return msg.type == 'error'
          && self.ignore.indexOf(msg.message) == -1;
    }

    function toErrorContext (lines) {
      return function (msg) {
        // Provide context for understanding where the error occurred
        // in the markup.
        // msg.lastColumn indicates the position of the
        // closing tag of the offending element
        var lineno = parseInt(msg.lastLine) - 1;
        var line   = lines[lineno];
        var colno  = parseInt(msg.lastColumn);
        var start  = line.lastIndexOf('<', colno-1);

        var context = line && line.substr(start - 20, (colno - start) + 40);

        // Clean up output
        return {
          error: msg.message,
          context: context,
          id: msg.messageid,
          type: msg.type,
          lastLine: lineno,
          lastColumn: colno
        };
      };
    }

    var lines  = buffer.split('\n');
    var validationErrors = _(res.body.messages)
      .chain()
      .filter(keepError)
      .map(toErrorContext(lines))
      .value();

    if (validationErrors && validationErrors.length > 0) {
      return callback(null, validationErrors);
    }

    return callback(null, null);
  });
};

/**
 * Create a validator with an optional list of exception messages to ignore
 *
 * @param {Array} ignore - optional
 * @param {Object} opts - optional
 * @return {Validator}
 */
module.exports.createValidator = function(ignore, opts) {
  return new Validator(ignore, opts);
};
