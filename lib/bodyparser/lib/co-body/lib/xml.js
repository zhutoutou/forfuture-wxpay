'use strict';

/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var XML = require('../../../../helper/xml');

// Allowed whitespace is defined in RFC 7159
var strictXMLReg = /^[\x20\x09\x0a\x0d]*(\[|\<)/;

/**
 * Return a Promise which parses xml requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */

module.exports = function (req, opts) {
  req = req.req || req;
  opts = opts || {};

  // defaults
  var len = req.headers['content-length'];
  var encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = len = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';
  var strict = opts.strict !== false;

  // raw-body returns a promise when no callback is specified
  return raw(inflate(req), opts).then(function (str) {
    try {
      return parse(str);
    } catch (err) {
      err.status = 400;
      err.body = str;
      throw err;
    }
  });

  function parse(str) {
    if (!strict) return str ? XML.xml2Object(str) : str;
    // strict mode always return object
    if (!str) return {};
    // strict XML test
    if (!strictXMLReg.test(str)) {
      throw new Error('invalid XML, only supports object and array');
    }
    return XML.xml2Object(str);
  }
};