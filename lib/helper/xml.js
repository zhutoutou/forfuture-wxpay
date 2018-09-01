'use strict';

var js2xml = require('xml');
var xml2js = require('xml2js');

var parse = new xml2js.Parser();
/**
 * XML序列化
 * @param {Object}          [必填] target          目标对象
 * @param {Array}           [必填] properties      需要设置CData的属性
 * @returns {String}
 */
function object2XML(target, properties) {
    if (properties) {
        properties.forEach(function (v) {
            if (target[v]) {
                var val = target[v];
                target[v] = {
                    _cdata: val
                };
            }
        });
    }
    return js2xml(target);
}

/**
 * XML反序列化
 * @param {String}          [必填] target            目标对象
 * @returns {Object} 
 */
function xml2Object(target) {
    return parse(target, { explicitArray: false });
}
module.exports = {
    object2XML: object2XML,
    xml2Object: xml2Object
};