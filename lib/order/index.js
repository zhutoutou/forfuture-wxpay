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
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx, next) {
        var result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return unifiedorder(ctx.request);

                    case 3:
                        result = _context2.sent;

                        ctx.state.$orderInfo = {
                            data: result
                        };
                        _context2.next = 10;
                        break;

                    case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](0);

                        ctx.state.$orderInfo = {
                            err: _context2.t0.message };

                    case 10:
                        next();

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 7]]);
    }));

    return function unifiedorderMiddleware(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * Koa 授权中间件
 * 基于 notifyorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Object}
 */


var notifyorderMiddleware = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx, next) {
        var result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return notifyorder(ctx.req);

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

    return function notifyorderMiddleware(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('wxpay-sdk[unified]');
var http = require('axios');
var moment = require('moment');

var _require = require('../helper/xml'),
    object2XML = _require.object2XML,
    xml2Object = _require.xml2Object;

var _require2 = require('../helper/sign'),
    signObject = _require2.signObject;

var OrderDbService = require('../mysql/OrderDbService');
var config = require('../../config');

var _require3 = require('../constants'),
    ERRORS = _require3.ERRORS,
    ORDER_ORIGIN = _require3.ORDER_ORIGIN;

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
            var spbill_create_ip, _req$query, device_info, body, detail, attach, total_fee, goods_tag, product_id, openid, origin, findRes, appid, mch_id, fee_type, notify_url, limit_pay, sign_type, trade_type, nonce_str, time_start, time_expire, _params, out_trade_no, paramXML, res, result;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            spbill_create_ip = req.headers['x-real-ip'];
                            _req$query = req.query, device_info = _req$query.device_info, body = _req$query.body, detail = _req$query.detail, attach = _req$query.attach, total_fee = _req$query.total_fee, goods_tag = _req$query.goods_tag, product_id = _req$query.product_id, openid = _req$query.openid;
                            origin = req.query.origin;

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
                            appid = undefined;
                            _context.t0 = origin;
                            _context.next = _context.t0 === 0 ? 15 : _context.t0 === 1 ? 17 : 19;
                            break;

                        case 15:
                            appid = config.miniProgram.appId;
                            return _context.abrupt('break', 20);

                        case 17:
                            appid = config.platform.appId;
                            return _context.abrupt('break', 20);

                        case 19:
                            return _context.abrupt('break', 20);

                        case 20:
                            if (appid) {
                                _context.next = 22;
                                break;
                            }

                            throw new Error(ERRORS.ERR_NO_SUPPROT_ORIGIN + '\n' + origin);

                        case 22:
                            mch_id = config.mch.mch_id;
                            fee_type = config.mch.fee_type;
                            notify_url = config.mch.notify_url;
                            limit_pay = config.mch.limit_pay;
                            // 默认值

                            sign_type = 'MD5';
                            trade_type = 'JSAPI';

                            // 随机数

                            nonce_str = Math.floor(Math.random() * 10000000);
                            time_start = moment().utcOffset(8).format('YYYYMMDDHHmmss');
                            time_expire = moment().utcOffset(8).add(config.mch.mch_expire || 30, 'm').format('YYYYMMDDHHmmss');

                            // 构建统一下单参数

                            _params = {
                                appid: appid,
                                mch_id: mch_id,
                                device_info: device_info,
                                nonce_str: nonce_str,
                                sign_type: sign_type,
                                body: body,
                                detail: detail,
                                attach: attach,
                                out_trade_no: out_trade_no,
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
                            _context.next = 34;
                            return OrderDbService.initOrderInfo(_params, origin);

                        case 34:
                            out_trade_no = _context.sent;

                            _params.out_trade_no = out_trade_no;
                            debug('out_trade_no:%s', out_trade_no);
                            // XML生成
                            paramXML = object2XML(signObject(_params, config.mch.sign_key, 'sign'));
                            // 统一下单接口请求

                            _context.next = 40;
                            return http({
                                url: config.mch.unifiedorderUrl,
                                method: 'POST',
                                data: paramXML
                            });

                        case 40:
                            res = _context.sent;
                            _context.next = 43;
                            return xml2Object(res.data);

                        case 43:
                            res = _context.sent;

                            if (!(res.return_code !== 'SUCCESS' || res.result_code !== 'SUCCESS')) {
                                _context.next = 47;
                                break;
                            }

                            debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, res);
                            throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(res));

                        case 47:
                            debug('result_code: %s', res.prepay_id);
                            // 存储统一下单信息
                            _context.next = 50;
                            return OrderDbService.unifiedOrderInfo(res.prepay_id, out_trade_no);

                        case 50:
                            // 构建返回值
                            result = {
                                appId: appid,
                                timeStamp: moment().format('X'),
                                nonceStr: Math.floor(Math.random() * 10000000).toString(),
                                package: 'prepay_id=' + res.prepay_id,
                                signType: sign_type
                            };

                            resolve(signObject(result, config.mch.sign_key, 'paySign'));

                            _context.next = 59;
                            break;

                        case 54:
                            _context.prev = 54;
                            _context.t1 = _context['catch'](0);

                            debug(ERRORS.ERR_UNIFIEDORDER + '\n' + JSON.stringify(_context.t1));
                            console.log('ERR_UNIFIEDORDER', ERRORS.ERR_UNIFIEDORDER + '\n' + _context.t1);
                            reject(new Error(ERRORS.ERR_UNIFIEDORDER + '\n' + _context.t1));

                        case 59:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 54]]);
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
    return new Promise(function (resolve, reject) {
        try {

            // 验证签名
            var _req$body = req.body,
                sign = _req$body.sign,
                return_code = _req$body.return_code,
                result_code = _req$body.result_code;

            if (return_code !== 'SUCCESS' || result_code !== 'SUCCESS') {
                debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, req.query);
                throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(params));
            }
            if (_sign !== signObject(params, config.mch.sign_key, 'sign').sign) {
                debug(ERRORS.ERR_SIGN_VALID);
                throw new Error(ERRORS.ERR_SIGN_VALID);
            }
            resolve(object2XML({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            }));
        } catch (e) {
            debug(ERRORS.ERR_NOTIFYORDE + '\n' + JSON.stringify(e));
            reject(new Error(ERRORS.ERR_NOTIFYORDE + '\n' + JSON.stringify(e)));
        }
    });
}

module.exports = {
    unifiedorder: unifiedorder,
    unifiedorderMiddleware: unifiedorderMiddleware,
    notifyorder: notifyorder,
    notifyorderMiddleware: notifyorderMiddleware
};