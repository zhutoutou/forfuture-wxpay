'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * 储存订单信息
 * @param {object} orderInfo 
 * @return {string}
 */
var initOrderInfo = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(orderInfo, origin) {
        var order_info, out_trade_no, state, open_id, init_time;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        order_info = JSON.stringify(orderInfo);
                        out_trade_no = uuidGenerator().replace(/-/g, "");
                        state = ORDER_STATE.INIT;
                        open_id = orderInfo.openid;
                        init_time = moment().format('YYYY-MM-DD HH:mm:ss');
                        _context.next = 8;
                        return mysql('cOrder').insert({
                            order_info: order_info,
                            out_trade_no: out_trade_no,
                            open_id: open_id,
                            state: state,
                            init_time: init_time,
                            origin: origin
                        });

                    case 8:
                        return _context.abrupt('return', out_trade_no);

                    case 11:
                        _context.prev = 11;
                        _context.t0 = _context['catch'](0);

                        debug('%s: %O', ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB, _context.t0);
                        throw new Error(ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB + '\n' + _context.t0);

                    case 15:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 11]]);
    }));

    return function initOrderInfo(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * 更新订单信息
 * @param {string} prepay_id 
 * @param {string} out_trade_no 
 * @return {void}
 */


var unifiedOrderInfo = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(prepay_id, out_trade_no) {
        var res, unified_time, state;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return mysql('cOrder').count('out_trade_no as hasOrder').where({ out_trade_no: out_trade_no });

                    case 3:
                        res = _context2.sent;

                        if (res[0].hasOrder) {
                            _context2.next = 6;
                            break;
                        }

                        throw new Error(ERRORS.DBERR.ERR_NO_ORDER_FOUND + '\nout_trade_no:' + out_trade_no);

                    case 6:
                        unified_time = moment().format('YYYY-MM-DD HH:mm:ss');
                        state = ORDER_STATE.UNIFIED;
                        _context2.next = 10;
                        return mysql('cOrder').update({
                            prepay_id: prepay_id,
                            state: state,
                            unified_time: unified_time
                        }).where({ out_trade_no: out_trade_no });

                    case 10:
                        _context2.next = 16;
                        break;

                    case 12:
                        _context2.prev = 12;
                        _context2.t0 = _context2['catch'](0);

                        debug('%s: %O', ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB, _context2.t0);
                        throw new Error(ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB + '\n' + _context2.t0);

                    case 16:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 12]]);
    }));

    return function unifiedOrderInfo(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * 查找来源信息
 * @param {string} out_trade_no 
 * @return {void}
 */


var findOriginInfo = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(out_trade_no) {
        var findRes, origin;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return mysql('cOrder').select('cOrder.origin').where({ out_trade_no: out_trade_no }).first();

                    case 3:
                        findRes = _context3.sent;

                        if (findRes) {
                            _context3.next = 6;
                            break;
                        }

                        throw new Error(ERRORS.DBERR.ERR_NO_ORDER_FOUND + '\nout_trade_no:' + out_trade_no);

                    case 6:
                        origin = findRes.origin;
                        return _context3.abrupt('return', origin);

                    case 10:
                        _context3.prev = 10;
                        _context3.t0 = _context3['catch'](0);

                        debug('%s: %O', ERRORS.DBERR.ERR_WHEN_SELECT_TO_DB, _context3.t0);
                        throw new Error(ERRORS.DBERR.ERR_WHEN_SELECT_TO_DB + '\n' + _context3.t0);

                    case 14:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 10]]);
    }));

    return function findOriginInfo(_x5) {
        return _ref3.apply(this, arguments);
    };
}();

/**
 * 更新订单信息
 * @param {string} prepay_id 
 * @param {string} out_trade_no 
 * @return {void}
 */


var notifyOrderInfo = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(out_trade_no) {
        var res, notify_time, state;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        _context4.next = 3;
                        return mysql('cOrder').count('out_trade_no as hasOrder').where({ out_trade_no: out_trade_no });

                    case 3:
                        res = _context4.sent;

                        if (res[0].hasOrder) {
                            _context4.next = 6;
                            break;
                        }

                        throw new Error(ERRORS.DBERR.ERR_NO_ORDER_FOUND + '\nout_trade_no:' + out_trade_no);

                    case 6:
                        notify_time = moment().format('YYYY-MM-DD HH:mm:ss');
                        state = ORDER_STATE.NOTIFY;
                        _context4.next = 10;
                        return mysql('cOrder').update({
                            state: state,
                            notify_time: notify_time
                        }).where({ out_trade_no: out_trade_no });

                    case 10:
                        _context4.next = 16;
                        break;

                    case 12:
                        _context4.prev = 12;
                        _context4.t0 = _context4['catch'](0);

                        debug('%s: %O', ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB, _context4.t0);
                        throw new Error(ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB + '\n' + _context4.t0);

                    case 16:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 12]]);
    }));

    return function notifyOrderInfo(_x6) {
        return _ref4.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('qcloud-sdk[AuthDbService]');
var uuidGenerator = require('uuid/v4');
var moment = require('moment');

var _require = require('../constants'),
    ERRORS = _require.ERRORS,
    ORDER_STATE = _require.ORDER_STATE;

var mysql = require('./index');

module.exports = {
    initOrderInfo: initOrderInfo,
    unifiedOrderInfo: unifiedOrderInfo,
    notifyOrderInfo: notifyOrderInfo,
    findOriginInfo: findOriginInfo
};