/**!
 * koa-body-parser - index.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var parse = require('./lib/co-body');

/**
 * @param [Object] opts
 *   - {String} jsonLimit default '1mb'
 *   - {String} formLimit default '56kb'
 *   - {string} encoding default 'utf-8'
 *   - {Object} extendTypes
 */

module.exports = function (opts) {
  opts = opts || {};
  var detectJSON = opts.detectJSON;
  var onerror = opts.onerror || throwError;

  var enableTypes = opts.enableTypes || ['json', 'form'];
  var enableForm = checkEnable(enableTypes, 'form');
  var enableJson = checkEnable(enableTypes, 'json');
  var enableText = checkEnable(enableTypes, 'text');

  opts.detectJSON = undefined;
  opts.onerror = undefined;

  // default json types
  var jsonTypes = ['application/json', 'application/json-patch+json', 'application/vnd.api+json', 'application/csp-report'];

  // default form types
  var formTypes = ['application/x-www-form-urlencoded'];

  // default text types
  var textTypes = ['text/plain'];

  // default xml types
  var xmlTypes = ['text/xml'];

  var jsonOpts = formatOptions(opts, 'json');
  var formOpts = formatOptions(opts, 'form');
  var textOpts = formatOptions(opts, 'text');
  var xmlOpts = formatOptions(opts, 'xml');

  var extendTypes = opts.extendTypes || {};

  extendType(jsonTypes, extendTypes.json);
  extendType(formTypes, extendTypes.form);
  extendType(textTypes, extendTypes.text);
  extendType(xmlTypes, extendType.xml);

  return function bodyParser(ctx, next) {
    if (ctx.request.method.toUpperCase() === 'GET') {
      ctx.request.body = ctx.request.query;
      return next();
    }
    if (ctx.request.body !== undefined) return next();

    return parseBody(ctx).then(function (body) {
      ctx.request.body = body;
      return next();
    }, function (err) {
      return onerror(err, ctx);
    });
  };

  function parseBody(ctx) {
    if (enableJson && (detectJSON && detectJSON(ctx) || ctx.request.is(jsonTypes))) {
      return parse.json(ctx, jsonOpts);
    }
    if (enableForm && ctx.request.is(formTypes)) {
      return parse.form(ctx, formOpts);
    }
    if (enableText && ctx.request.is(textTypes)) {
      console.log('text格式');
      return parse.text(ctx, textOpts) || '';
    }
    if (enableText && ctx.request.is(xmlTypes)) {
      console.log('xml格式');
      return parse.xml(ctx, xmlOpts);
    }
    console.log('其他格式');
    return Promise.resolve({});
  }
};

function formatOptions(opts, type) {
  var res = {};
  Object.assign(res, opts);
  res.limit = opts[type + 'Limit'];
  return res;
}

function extendType(original, extend) {
  if (extend) {
    if (!Array.isArray(extend)) {
      extend = [extend];
    }
    extend.forEach(function (extend) {
      return original.push(extend);
    });
  }
}

function throwError(err) {
  throw err;
}

function checkEnable(types, type) {
  return types.indexOf(type) >= 0;
}