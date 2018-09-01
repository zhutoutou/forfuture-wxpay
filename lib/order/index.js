'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('wxpay-sdk[unified]');
var http = require('axios');
var moument = require('moument');

var _require = require('../helper/xml'),
    object2XML = _require.object2XML;

var sign = require('../helper/sign');
var OrderDbService = require('../mysql/OrderDbService');
var config = require('../../config');

var _require2 = require('../constants'),
    ERRORS = _require2.ERRORS;

var cdataproperties = ['detail'];

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
 */
function unifiedorder(req) {
    var _this = this;

    return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
            var _req$query, device_info, body, detail, attach, total_fee, spbill_create_ip, goods_tag, product_id, openid, appid, mch_id, fee_type, notify_url, limit_pay, sign_type, trade_type, nonce_str, time_start, time_expire, params, out_trade_no, paramXML, res, result;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _req$query = req.query, device_info = _req$query.device_info, body = _req$query.body, detail = _req$query.detail, attach = _req$query.attach, total_fee = _req$query.total_fee, spbill_create_ip = _req$query.spbill_create_ip, goods_tag = _req$query.goods_tag, product_id = _req$query.product_id, openid = _req$query.openid;

                            if (![body, total_fee, spbill_create_ip].every(function (v) {
                                return !v;
                            })) {
                                _context.next = 5;
                                break;
                            }

                            debug(ERRORS.ERR_REQ_PARAM_MISSED);
                            throw new Error(ERRORS.ERR_REQ_PARAM_MISSED);

                        case 5:
                            // 一些配置项
                            appid = config.miniProgram.appId;
                            mch_id = config.mch.mch_id;
                            fee_type = config.mch.fee_type;
                            notify_url = config.mch.notify_url;
                            limit_pay = config.mch.limit_pay;
                            // 默认值

                            sign_type = 'MD5';
                            trade_type = 'JSAPI';

                            // 随机数

                            nonce_str = Math.floor(Math.random() * 10000000);
                            time_start = moument().utcOffset(8).format('YYYYMMDDHHmmss');
                            time_expire = moument().utcOffset(8).add(config.mch.mch_expire || 30, 'm').format('YYYYMMDDHHmmss');

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
                            }.sign(mch.sign_key, 'sign');
                            // 储存订单信息

                            out_trade_no = OrderDbService.initOrderInfo(params);

                            params.out_trade_no = out_trade_no;
                            debug('out_trade_no:%s', out_trade_no);
                            // XML生成
                            paramXML = object2XML(params, cdataproperties);
                            // 统一下单接口请求

                            _context.next = 22;
                            return http({
                                url: config.mch.unifiedorderUrl,
                                method: 'POST',
                                params: paramXML
                            });

                        case 22:
                            res = _context.sent;

                            res = res.data;

                            if (!(res.return_code !== 'SUCCESS' || res.result_code !== 'SUCCESS')) {
                                _context.next = 27;
                                break;
                            }

                            debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, res);
                            throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(res));

                        case 27:
                            debug('result_code: %s', res.prepay_id);
                            // 存储统一下单信息
                            OrderDbService.unifiedOrderInfo(prepay_id, out_trade_no);
                            // 构建返回值
                            result = {
                                appId: appId,
                                timestamp: moment().format('X'),
                                nonceStr: Math.floor(Math.random() * 10000000),
                                package: 'prepay_id=' + res.prepay_id,
                                signType: sign_type
                            };

                            resolve(result.sign(config.mch.sign_key, 'paySign'));

                            _context.next = 37;
                            break;

                        case 33:
                            _context.prev = 33;
                            _context.t0 = _context['catch'](0);

                            debug(Errors.ERR_NOTIFYORDE + '\n' + JSON.stringify(_context.t0));
                            reject(new Error(Errors.ERR_UNIFIEDORDER + '\n' + _context.t0));

                        case 37:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 33]]);
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
            var _req$query2 = req.query,
                _sign = _req$query2.sign,
                return_code = _req$query2.return_code;

            if (return_code !== 'SUCCESS' || lt_code !== 'SUCCESS') {
                debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, req.query);
                throw new Error(ERRORS.ERR_POST_UNIFIEDOREDER + '\n' + JSON.stringify(req.query));
            }
            if (_sign !== req.sign(config.mch.sign_key, 'sign').sign) {
                debug(ERRORS.ERR_SIGN_VALID);
                throw new Error(ERRORS.ERR_SIGN_VALID);
            }
            console.log('收到支付通知消息', req.query);
            resolve({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            });
        } catch (e) {
            debug(Errors.ERR_NOTIFYORDE + '\n' + JSON.stringify(e));
            reject(new Error(Errors.ERR_NOTIFYORDE + '\n' + JSON.stringify(e)));
        }
    });
}

/**
 * Koa 授权中间件
 * 基于 unifiedorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function unifiedorderMiddleware(ctx, next) {
    return unifiedorder(ctx.req).then(function (result) {
        ctx.state.$orderInfo = result;
        return next();
    });
}

/**
 * Koa 授权中间件
 * 基于 notifyorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function notifyorderMiddleware(ctx, next) {
    return notifyorder(ctx.req).then(function (result) {
        ctx.state.$orderInfo = result;
        return next();
    });
}

module.exports = {
    unifiedorder: unifiedorder,
    unifiedorderMiddleware: unifiedorderMiddleware,
    notifyorder: notifyorder,
    notifyorderMiddleware: notifyorderMiddleware
};