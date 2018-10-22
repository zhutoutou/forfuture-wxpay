'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * Koa 授权中间件
 * 基于 unifiedorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Object}
 */
var unifiedorderMiddleware = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx, next) {
        var result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return unifiedorder(ctx.request);

                    case 3:
                        result = _context3.sent;

                        ctx.state.$orderInfo = {
                            data: result
                        };
                        _context3.next = 10;
                        break;

                    case 7:
                        _context3.prev = 7;
                        _context3.t0 = _context3['catch'](0);

                        ctx.state.$orderInfo = {
                            err: _context3.t0.message };

                    case 10:
                        next();

                    case 11:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 7]]);
    }));

    return function unifiedorderMiddleware(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

/**
 * Koa 授权中间件
 * 基于 notifyorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Object}
 */


var notifyorderMiddleware = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx, next) {
        var result;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        _context4.next = 3;
                        return notifyorder(ctx.request);

                    case 3:
                        result = _context4.sent;

                        ctx.state.$orderInfo = {
                            data: result
                        };
                        _context4.next = 10;
                        break;

                    case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4['catch'](0);

                        ctx.state.$orderInfo = {
                            err: _context4.t0.message };

                    case 10:
                        next();

                    case 11:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 7]]);
    }));

    return function notifyorderMiddleware(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('wxpay-sdk[unified]');
var http = require('axios');
var moment = require('moment');
var XML = require('../helper/xml');

var _require = require('../helper/sign'),
    signObject = _require.signObject;

var OrderDbService = require('../mysql/OrderDbService');
var config = require('../../config');

var _require2 = require('../constants'),
    ERRORS = _require2.ERRORS,
    ORDER_ORIGIN = _require2.ORDER_ORIGIN;

// const cdataproperties = [
//     'detail'
// ]


/*
地址：http://www.pkfis.cn/wx/unified
参数：
body        String  商品描述
 * @param {String(128)}     [必填] body             商品描述

 * @param {Int}             [必填] total_fee        标价金额(分)

 * @param {String(16)}      [必填] spbill_create_ip 终端IP

返回：

code            0成功，-1失败
data            返回的内容
当code = 0 的时候应该返回
appId
timestamp
nonceStr
package
signType

这些参数用于调用wx.requestPayment(OBJECT)

*/

/**
 * 统一下单模块
 * @param {express request} req
 * @return {Promise}
 * @example 基于 Express
 * unifiedorder(this.req).then(orderinfo => { // ...some code })
 * @param {String(32)}      [必填] appid            小程序ID
 * @param {String(32)}      [必填] mch_id           商户号
 * @param {String(32)}      [可选] device_info      设备号
 * @param {String(32)}      [必填] nonce_str        随机字符串
 * @param {String(32)}      [必填] sign             签名
 * @param {String(32)}      [可选] sign_type        签名类型-MD5
 * @param {String(128)}     [必填] body             商品描述
 * @param {String(6000)}    [可选] detail           商品详情
 * @param {String(127)}     [可选] attach           附加数据
 * @param {String(32)}      [必填] out_trade_no     商户订单号
 * @param {String(16)}      [可选] fee_type         标价币种CNY
 * @param {Int}             [必填] total_fee        标价金额(分)
 * @param {String(16)}      [必填] spbill_create_ip 终端IP
 * @param {String(14)}      [可选] time_start       交易起始时间
 * @param {String(14)}      [可选] time_expire      交易结束时间
 * @param {String(32)}      [可选] goods_tag        订单优惠标记
 * @param {String(256)}     [必填] notify_url       通知地址
 * @param {String(16)}      [必填] trade_type       交易类型-JSAPI
 * @param {String(32)}      [可选] product_id       商品ID
 * @param {String(32)}      [可选] limit_pay        指定支付方式
 * @param {String(128)}     [可选] openid           用户标识
 * @param {Object}          [可选] scene_info       公众号专用
 * @param {String(16)}      [必选] origin           来源 小程序还是微信公众号
 */


function unifiedorder(req) {
    var _this = this;

    return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, reject) {
            var spbill_create_ip, _req$body, device_info, body, detail, attach, total_fee, goods_tag, product_id, openid, origin, findRes, conf, appid, mch, mch_id, fee_type, notify_url, limit_pay, sign_type, trade_type, nonce_str, time_start, time_expire, params, out_trade_no, paramXML, res, result;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            spbill_create_ip = req.headers['x-real-ip'];
                            _req$body = req.body, device_info = _req$body.device_info, body = _req$body.body, detail = _req$body.detail, attach = _req$body.attach, total_fee = _req$body.total_fee, goods_tag = _req$body.goods_tag, product_id = _req$body.product_id, openid = _req$body.openid;
                            origin = req.body.origin;

                            if (![body, total_fee, spbill_create_ip, openid].every(function (v) {
                                return !v;
                            })) {
                                _context.next = 7;
                                break;
                            }

                            debug(ERRORS.ERR_REQ_PARAM_MISSED);
                            throw new Error(ERRORS.ERR_REQ_PARAM_MISSED);

                        case 7:
                            // 检测来源
                            findRes = ORDER_ORIGIN.find(function (v) {
                                return v.name === origin;
                            });

                            if (findRes) {
                                _context.next = 10;
                                break;
                            }

                            throw new Error(ERRORS.ERR_UNKNOW_ORIGIN + '\n' + origin);

                        case 10:
                            origin = findRes.value;
                            conf = originConfig(origin);

                            if (!(!conf || [conf.appid, conf.mch].some(function (v) {
                                return !v;
                            }))) {
                                _context.next = 14;
                                break;
                            }

                            throw new Error(ERRORS.ERR_NO_SUPPROT_ORIGIN + '\n' + origin);

                        case 14:
                            // 一些配置项
                            appid = conf.appid;
                            mch = conf.mch;
                            mch_id = mch.mch_id;
                            fee_type = mch.fee_type;
                            notify_url = mch.notify_url;
                            limit_pay = mch.limit_pay;
                            // 默认值

                            sign_type = 'MD5';
                            trade_type = 'JSAPI';

                            // 随机数

                            nonce_str = Math.floor(Math.random() * 10000000);
                            time_start = moment().utcOffset(8).format('YYYYMMDDHHmmss');
                            time_expire = moment().utcOffset(8).add(mch.mch_expire || 30, 'm').format('YYYYMMDDHHmmss');

                            // 构建统一下单参数

                            params = {
                                appid: appid,
                                mch_id: mch_id,
                                device_info: device_info,
                                nonce_str: nonce_str,
                                sign_type: sign_type,
                                body: body,
                                detail: detail,
                                attach: attach,
                                fee_type: fee_type,
                                total_fee: total_fee,
                                spbill_create_ip: spbill_create_ip,
                                time_start: time_start,
                                time_expire: time_expire,
                                goods_tag: goods_tag,
                                notify_url: notify_url,
                                trade_type: trade_type,
                                product_id: product_id,
                                limit_pay: limit_pay,
                                openid: openid
                                // 储存订单信息
                            };
                            _context.next = 28;
                            return OrderDbService.initOrderInfo(params, origin);

                        case 28:
                            out_trade_no = _context.sent;

                            params.out_trade_no = out_trade_no;
                            debug('out_trade_no:%s', out_trade_no);
                            // XML生成
                            paramXML = XML.object2XML(signObject(params, mch.sign_key, 'sign'));
                            // 统一下单接口请求

                            _context.next = 34;
                            return http({
                                url: mch.unifiedorderUrl,
                                method: 'POST',
                                data: paramXML
                            });

                        case 34:
                            res = _context.sent;
                            _context.next = 37;
                            return XML.xml2Object(res.data);

                        case 37:
                            res = _context.sent;

                            if (!(res.return_code !== 'SUCCESS' || res.result_code !== 'SUCCESS')) {
                                _context.next = 41;
                                break;
                            }

                            debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, res);
                            throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(res));

                        case 41:
                            debug('result_code: %s', res.prepay_id);
                            // 存储统一下单信息
                            _context.next = 44;
                            return OrderDbService.unifiedOrderInfo(res.prepay_id, out_trade_no);

                        case 44:
                            // 构建返回值
                            result = {
                                appId: appid,
                                timeStamp: moment().format('X'),
                                nonceStr: Math.floor(Math.random() * 10000000).toString(),
                                package: 'prepay_id=' + res.prepay_id,
                                signType: sign_type
                            };

                            resolve(signObject(result, mch.sign_key, 'paySign'));

                            _context.next = 53;
                            break;

                        case 48:
                            _context.prev = 48;
                            _context.t0 = _context['catch'](0);

                            debug(ERRORS.ERR_UNIFIEDORDER + '\n' + JSON.stringify(_context.t0));
                            console.log('ERR_UNIFIEDORDER', ERRORS.ERR_UNIFIEDORDER + '\n' + _context.t0);
                            reject(new Error(ERRORS.ERR_UNIFIEDORDER + '\n' + _context.t0));

                        case 53:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 48]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }());
}

/**
 * 支付通知模块
 * @param {express request} req
 * @return {Promise}
 * @example 基于 Express
 * unifiedorder(this.req).then(orderinfo => { // ...some code })
 */
function notifyorder(req) {
    var _this2 = this;

    return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve, reject) {
            var _req$body2, sign, return_code, result_code, out_trade_no, origin, conf, mch;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;

                            // 验证签名
                            _req$body2 = req.body, sign = _req$body2.sign, return_code = _req$body2.return_code, result_code = _req$body2.result_code;

                            if (!(return_code !== 'SUCCESS' || result_code !== 'SUCCESS')) {
                                _context2.next = 5;
                                break;
                            }

                            debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, req.body);
                            throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(req.body));

                        case 5:
                            out_trade_no = req.body.out_trade_no;
                            _context2.next = 8;
                            return OrderDbService.findOriginInfo(out_trade_no);

                        case 8:
                            origin = _context2.sent;
                            conf = originConfig(origin);

                            if (!(!conf || [conf.appid, conf.mch].some(function (v) {
                                return !v;
                            }))) {
                                _context2.next = 12;
                                break;
                            }

                            throw new Error(ERRORS.ERR_NO_SUPPROT_ORIGIN + '\n' + origin);

                        case 12:
                            mch = conf.mch;

                            if (!(sign !== signObject(req.body, mch.sign_key, 'sign').sign)) {
                                _context2.next = 16;
                                break;
                            }

                            debug(ERRORS.ERR_SIGN_VALID);
                            throw new Error(ERRORS.ERR_SIGN_VALID);

                        case 16:
                            _context2.next = 18;
                            return OrderDbService.notifyOrderInfo(out_trade_no);

                        case 18:
                            resolve(XML.object2XML({
                                return_code: 'SUCCESS',
                                return_msg: 'OK'
                            }));
                            _context2.next = 25;
                            break;

                        case 21:
                            _context2.prev = 21;
                            _context2.t0 = _context2['catch'](0);

                            debug(ERRORS.ERR_NOTIFYORDE + '\n' + JSON.stringify(_context2.t0));
                            reject(new Error(ERRORS.ERR_NOTIFYORDE + '\n' + JSON.stringify(_context2.t0)));

                        case 25:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2, [[0, 21]]);
        }));

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    }());
}

function originConfig(origin) {
    switch (origin) {
        case 0:
            return {
                appid: config.miniProgram.appId,
                mch: config.miniProgram.mch,
                origin: origin };
        case 1:
            return {
                appid: config.platform.appId,
                mch: config.platform.mch,
                origin: origin };
        default:
            return undefined;
    }
}

module.exports = {
    unifiedorder: unifiedorder,
    unifiedorderMiddleware: unifiedorderMiddleware,
    notifyorder: notifyorder,
    notifyorderMiddleware: notifyorderMiddleware
};