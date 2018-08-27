const debug = require('debug')('wxpay-sdk[unified]')
const http = require('axios')
const moument = require('moument')
const {object2XML} = require('../helper/xml')
const sign = require('../helper/sign')
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
            const { device_info, body, detail, attach, total_fee, spbill_create_ip,
                goods_tag, product_id, openid} = req.body
            if([body, total_fee, spbill_create_ip].some(v=>v === undefined)) throw new Error(ERRORS.ERR_REQ_PARAM_MISSED)

            // 一些配置项
            const appid = config.appId
            const mch_id = config.mch.mch_id
            const fee_type = config.mch.fee_type
            const notify_url = config.mch.notify_url
            const limit_pay = config.mch.limit_pay
            // 默认值
            const sign_type = 'MD5'
            const trade_type = 'JSAPI'

            // 随机数
            const nonce_str = Math.floor(Math.random() * 10000000)
            const time_start = moument().utcOffset(8).format('YYYYMMDDHHmmss')
            const time_expire = moument().utcOffset(8).add(config.mch_expire || 30, 'm').format('YYYYMMDDHHmmss')
            
            // 构建统一下单参数
            const params = {
                appid,
                mch_id,
                device_info,
                nonce_str,
                sign_type,
                body,
                detail,
                attach,
                out_trade_no,
                fee_type,
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
            }.sign(mch.sign_key,'sign')
            // 储存订单信息
            const out_trade_no = UnifiedDbService.initOrderInfo(params)
            params.out_trade_no = out_trade_no
            debug('out_trade_no:%s',out_trade_no)
            // XML生成
            const paramXML = object2XML(params,cdataproperties)
            // 统一下单接口请求
            let res = await http({
                url: config.mch.unifiedorderUrl,
                method: 'POST',
                params: paramXML
            })
            res = res.data
            if (res.return_msg || res.return_code !== 'SUCCESS' || res.result_code !=='SUCCESS') {
                debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, res.errmsg)
                throw new Error(`${ERRORS.ERR_POST_UNIFIEDOREDER}\n${JSON.stringify(res)}`)
            }
            debug('result_code: %s', res.prepay_id)
            // 存储统一下单信息
            UnifiedDbService.unifiedOrderInfo(prepay_id,out_trade_no)
            // 构建返回值
            const result = {
                appId,
                timestamp:moment().format('X'),
                nonceStr:Math.floor(Math.random() * 10000000),
                package:`prepay_id=${res.prepay_id}`,
                signType:sign_type,
            }
            resolve(result.sign(mch.sign_key,'paySign'))
            
        } catch(e){
            reject(new Error(`${Errors.ERR_UNIFIEDORDER}\n${e}`))
        }
    })
}

/**
 * 支付通知模块
 * @param {express request} req
 * @return {Promise}
 * @example 基于 Express
 * unifiedorder(this.req).then(orderinfo => { // ...some code })
 */
function notifyorder(req){
    return new Promise((resolve,reject)=>{
        try{
        // 验证签名
        const {sign} = req
        if(sign !== req.sign(config.mch.sign_key,'sign').sign) throw new Error(ERRORS.ERR_SIGN_VALID)

        } catch(e){
            reject(new Error(`${Errors.ERR_NOTIFYORDE}\n${JSON.stringify(e)}`))
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

/**
 * Koa 授权中间件
 * 基于 notifyorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function notifyorderMiddleware (ctx, next) {
    return notifyorder(ctx.req).then(result => {
        ctx.state.$orderInfo = result
        return next()
    })
}

module.exports = {
    unifiedorder,
    unifiedorderMiddleware,
    notifyorder,
    notifyorderMiddleware
}
