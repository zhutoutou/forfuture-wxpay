'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * XML反序列化
 * @param {String}          [必填] target            目标对象
 * @returns {Object} 
 */
var xml2Object = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(target) {
        var res;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        res = '';
                        _context.prev = 1;
                        _context.next = 4;
                        return xml2jsSync(target);

                    case 4:
                        res = _context.sent;
                        _context.next = 10;
                        break;

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](1);

                        console.log('xml2Objecterr' + JSON.stringify(_context.t0));

                    case 10:
                        return _context.abrupt('return', res);

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[1, 7]]);
    }));

    return function xml2Object(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var js2xml = require('xml');
var xml2js = require('xml2js');

var parse = new xml2js.Parser({ explicitArray: false });
var builder = new xml2js.Builder({ cdata: true });
/**
 * XML序列化
 * @param {Object}          [必填] target          目标对象
 * @returns {String}
 */
function object2XML(target) {
    return builder.buildObject(target);
}

function xml2jsSync(target) {
    return new Promise(function (resolve, reject) {
        parse.parseString(target, function (err, res) {
            if (res) resolve(res.xml);else reject(err);
        });
    });
}

module.exports = {
    object2XML: object2XML,
    xml2Object: xml2Object
};