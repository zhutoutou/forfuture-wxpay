'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('wxpay-sdk[unified]');
var http = require('axios');

var _require = require('../helper/xml'),
    object2XML = _require.object2XML;

var UnifiedDbService = require('../mysql/UnifiedDbService');
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
            var _req$body, nonce_str, device_info, sign, body, detail, attach, total_fee, spbill_create_ip, time_start, time_expire, goods_tag, notify_url, trade_type, product_id, limit_pay, openid, params, out_trade_no, paramXML, res;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _req$body = req.body, nonce_str = _req$body.nonce_str, device_info = _req$body.device_info, sign = _req$body.sign, body = _req$body.body, detail = _req$body.detail, attach = _req$body.attach, total_fee = _req$body.total_fee, spbill_create_ip = _req$body.spbill_create_ip, time_start = _req$body.time_start, time_expire = _req$body.time_expire, goods_tag = _req$body.goods_tag, notify_url = _req$body.notify_url, trade_type = _req$body.trade_type, product_id = _req$body.product_id, limit_pay = _req$body.limit_pay, openid = _req$body.openid;

                            if (![nonce_str, device_info, sign, body, detail, attach, total_fee, spbill_create_ip, time_start, time_expire, goods_tag, notify_url, trade_type, product_id, limit_pay, openid].some(function (v) {
                                return v === undefined;
                            })) {
                                _context.next = 4;
                                break;
                            }

                            throw new Error(ERRORS.ERR_REQ_PARAM_MISSED);

                        case 4:
                            // 构建统一下单参数
                            params = {
                                appid: appId,
                                mch_id: config.mch.mch_id,
                                device_info: device_info,
                                nonce_str: nonce_str,
                                sign: sign,
                                sign_type: config.mch.sign_type,
                                body: body,
                                detail: detail,
                                attach: attach,
                                out_trade_no: out_trade_no,
                                fee_type: config.mch.fee_type,
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
                            out_trade_no = UnifiedDbService.initOrderInfo(params);

                            debug('out_trade_no:%s', out_trade_no);
                            // XML生成
                            paramXML = object2XML(params, cdataproperties);
                            // 统一下单接口请求

                            _context.next = 10;
                            return http({
                                url: mch.orderUrl,
                                method: 'POST',
                                params: paramXML
                            });

                        case 10:
                            res = _context.sent;

                            res = res.data;

                            if (!(res.return_msg || !res.return_code || !res.result_code)) {
                                _context.next = 15;
                                break;
                            }

                            debug('%s: %O', ERRORS.ERR_GET_UNIFIEDOREDER, res.errmsg);
                            throw new Error(ERRORS.ERR_GET_UNIFIEDOREDER + '\n' + JSON.stringify(res));

                        case 15:
                            debug('result_code: %s', res.prepay_id);
                            UnifiedDbService.unifiedOrderInfo(prepay_id, out_trade_no);
                            resolve({
                                out_trade_no: out_trade_no,
                                prepay_id: res.prepay_id
                            });

                            _context.next = 23;
                            break;

                        case 20:
                            _context.prev = 20;
                            _context.t0 = _context['catch'](0);

                            reject(new Error(Errors.ERR_UNIFIEDORDER + '\n' + _context.t0));

                        case 23:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 20]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }());
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

module.exports = {
    unifiedorder: unifiedorder,
    unifiedorderMiddleware: unifiedorderMiddleware
};