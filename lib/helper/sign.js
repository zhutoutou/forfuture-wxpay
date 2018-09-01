'use strict';

var md5 = require('md5');

/**
 * 对对象进行加密算法
 * @param {String} key 
 * @param {String} signPerporty 
 */
Object.prototype.sign = function (key, signPerporty) {
    var _this = this;

    signPerporty = signPerporty || 'sign';
    var sortArr = Object.keys(this).sort();
    var stringSignTemp = '';
    sortArr.map(function (v) {
        if (v != signPerporty && _this[v]) {
            stringSignTemp += v + '=' + _this[v] + '&';
        }
    });
    if (key) stringSignTemp += 'key=' + key;
    this[signPerporty] = md5(stringSignTemp).toUpperCase();
    return this;
};