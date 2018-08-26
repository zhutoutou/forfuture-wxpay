const debug = require('debug')('wxpay-sdk[unified]')
const http = require('axios')
const {object2XML} = require('../helper/xml')
const UnifiedDbService = require('../mysql/UnifiedDbService')
const config = require('../../config')
const {ERRORS} = require('../constants')

const cdataproperties = [
    'detail'
]


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
 function unifiedorder (req) {
    return new Promise(async (resolve,reject)=>{
        try{
            const {nonce_str, device_info, sign, body, detail, attach, total_fee, spbill_create_ip,
                time_start, time_expire, goods_tag, notify_url, trade_type, product_id, limit_pay, openid} = req.body
            if([nonce_str, device_info, sign, body, detail, attach, total_fee, spbill_create_ip,
                time_start, time_expire, goods_tag, notify_url, trade_type, product_id, limit_pay, openid].some(v=>v === undefined)) throw new Error(ERRORS.ERR_REQ_PARAM_MISSED)
            // 构建统一下单参数
            const params = {
                appid: appId,
                mch_id: config.mch.mch_id,
                device_info,
                nonce_str,
                sign,
                sign_type: config.mch.sign_type,
                body,
                detail,
                attach,
                out_trade_no,
                fee_type: config.mch.fee_type,
                total_fee,
                spbill_create_ip,
                time_start,
                time_expire,
                goods_tag,
                notify_url,
                trade_type,
                product_id,
                limit_pay,
                openid
            }
            // 储存订单信息
            const out_trade_no = UnifiedDbService.initOrderInfo(params)
            debug('out_trade_no:%s',out_trade_no)
            // XML生成
            const paramXML = object2XML(params,cdataproperties)
            // 统一下单接口请求
            let res = await http({
                url: mch.orderUrl,
                method: 'POST',
                params: paramXML
            })
            res = res.data
            if (res.return_msg || !res.return_code || !res.result_code) {
                debug('%s: %O', ERRORS.ERR_GET_UNIFIEDOREDER, res.errmsg)
                throw new Error(`${ERRORS.ERR_GET_UNIFIEDOREDER}\n${JSON.stringify(res)}`)
            }
            debug('result_code: %s', res.prepay_id)
            UnifiedDbService.unifiedOrderInfo(prepay_id,out_trade_no)
            resolve({
                out_trade_no, 
                prepay_id:res.prepay_id
            })
            
        } catch(e){
            reject(new Error(`${Errors.ERR_UNIFIEDORDER}\n${e}`))
        }
    })
}

/**
 * Koa 授权中间件
 * 基于 unifiedorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function unifiedorderMiddleware (ctx, next) {
    return unifiedorder(ctx.req).then(result => {
        ctx.state.$orderInfo = result
        return next()
    })
}

module.exports = {
    unifiedorder,
    unifiedorderMiddleware
}
