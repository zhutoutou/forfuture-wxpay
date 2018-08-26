'use strict';

var xml = require('xml');

/**
 * XML序列化
 * @param {Object}          [必填] target          目标对象
 * @param {Array}           [必填] properties      需要设置CData的属性
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
    return xml(target);
}

module.exports = {
    object2XML: object2XML
};