'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var signMiddleware = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
        var params, _sign;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        params = ctx.selfParams;
                        _sign = params.sign; // 约定签名参数

                        if (!(_sign === signObject(params, signKey, 'sign').sign)) {
                            _context.next = 7;
                            break;
                        }

                        _context.next = 5;
                        return next();

                    case 5:
                        _context.next = 8;
                        break;

                    case 7:
                        ctx.state = {
                            code: -1,
                            data: {
                                msg: '签名验证失败'
                            }
                        };

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function signMiddleware(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../../config'),
    signKey = _require.signKey;

var _require2 = require('../helper/sign'),
    signObject = _require2.signObject;

module.exports = {
    signMiddleware: signMiddleware
};