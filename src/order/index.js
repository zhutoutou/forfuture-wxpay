const debug = require('debug')('wxpay-sdk[unified]')
const http = require('axios')
const moment = require('moment')
const XML= require('../helper/xml')
const {signObject} = require('../helper/sign')
const OrderDbService = require('../mysql/OrderDbService')
const config = require('../../config')
const {ERRORS,ORDER_ORIGIN} = require('../constants')

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
 * @param {String{100}}     [可选] unionId          唯一标识
 */
 function unifiedorder (req) {
    return new Promise(async (resolve,reject)=>{
        try{
            const {
                'x-real-ip': spbill_create_ip
            } = req.headers
            const { device_info, body, detail, attach, total_fee,
                goods_tag, product_id, openid ,unionid} = req.body
            let {origin} = req.body
            if([body, total_fee, spbill_create_ip,openid].every(v=>!v)) {
                debug(ERRORS.ERR_REQ_PARAM_MISSED)
                throw new Error(ERRORS.ERR_REQ_PARAM_MISSED)
            }
            // 检测来源
            const findRes  = ORDER_ORIGIN.find(v => v.name === origin)
            if(!findRes) throw new Error(`${ERRORS.ERR_UNKNOW_ORIGIN}\n${origin}`)
            origin = findRes.value
            const conf = originConfig(origin)
            if(!conf || [conf.appid,conf.mch].some(v=>!v)) throw new Error(`${ERRORS.ERR_NO_SUPPROT_ORIGIN}\n${origin}`)
            // 一些配置项
            const appid = conf.appid
            const mch = conf.mch
            const mch_id = mch.mch_id
            const fee_type = mch.fee_type
            const notify_url = mch.notify_url
            const limit_pay = mch.limit_pay
            // 默认值
            const sign_type = 'MD5'
            const trade_type = 'JSAPI'

            // 随机数
            const nonce_str = Math.floor(Math.random() * 10000000)
            const time_start = moment().utcOffset(8).format('YYYYMMDDHHmmss')
            const time_expire = moment().utcOffset(8).add(mch.mch_expire || 30, 'm').format('YYYYMMDDHHmmss')

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
            }
            // 储存订单信息
            const out_trade_no = await OrderDbService.initOrderInfo(params,origin,unionid)
            params.out_trade_no = out_trade_no
            debug('out_trade_no:%s',out_trade_no)
            // XML生成
            const paramXML = XML.object2XML(signObject(params,mch.sign_key,'sign'))
            // 统一下单接口请求
            let res = await http({
                url: mch.unifiedorderUrl,
                method: 'POST',
                data: paramXML
            })
            res = await XML.xml2Object(res.data)
            if (res.return_code !== 'SUCCESS' || res.result_code !=='SUCCESS') {
                debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, res)
                throw new Error(`${ERRORS.ERR_POST_UNIFIEDOREDER}\n${JSON.stringify(res)}`)
            }
            debug('result_code: %s', res.prepay_id)
            // 存储统一下单信息
            await OrderDbService.unifiedOrderInfo(res.prepay_id,out_trade_no)
            // 构建返回值
            const result = {
                appId:appid,
                timeStamp:moment().format('X'),
                nonceStr:Math.floor(Math.random() * 10000000).toString(),
                package:`prepay_id=${res.prepay_id}`,
                signType:sign_type,
            }
            resolve(signObject(result,mch.sign_key,'paySign'))
            
        } catch(e){
            debug(`${ERRORS.ERR_UNIFIEDORDER}\n${JSON.stringify(e)}`)
            console.log('ERR_UNIFIEDORDER',`${ERRORS.ERR_UNIFIEDORDER}\n${e}`)
            reject(new Error(`${ERRORS.ERR_UNIFIEDORDER}\n${e}`))
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
    return new Promise(async(resolve,reject)=>{
        try{
        // 验证签名
        const {sign,return_code,result_code} = req.body
        if (return_code !== 'SUCCESS' || result_code !=='SUCCESS') {
            debug('%s: %O', ERRORS.ERR_POST_UNIFIEDOREDER, req.body)
            throw new Error(`${ERRORS.ERR_POST_UNIFIEDOREDER}\n${JSON.stringify(req.body)}`)
        }
        const {out_trade_no} = req.body
        const origin = await OrderDbService.findOriginInfo(out_trade_no)
        const conf = originConfig(origin)
        if(!conf || [conf.appid,conf.mch].some(v=>!v)) throw new Error(`${ERRORS.ERR_NO_SUPPROT_ORIGIN}\n${origin}`)
        const mch = conf.mch
        if(sign !== signObject(req.body,mch.sign_key,'sign').sign) {
            debug(ERRORS.ERR_SIGN_VALID)
            throw new Error(ERRORS.ERR_SIGN_VALID)
        }
        await OrderDbService.notifyOrderInfo(out_trade_no)
        resolve(XML.object2XML({
            return_code:'SUCCESS',
            return_msg:'OK'
        }))
        } catch(e){
            debug(`${ERRORS.ERR_NOTIFYORDE}\n${JSON.stringify(e)}`)
            reject(new Error(`${ERRORS.ERR_NOTIFYORDE}\n${JSON.stringify(e)}`))
        }
    })
    
}

/**
 * Koa 授权中间件
 * 基于 unifiedorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Object}
 */
async function unifiedorderMiddleware (ctx, next) {
    try{
        const result = await unifiedorder(ctx.request)
        ctx.state.$orderInfo = {
            data:result
        }
    }
    catch(err){
        ctx.state.$orderInfo = {
            err:err.message}
    }
    next()
}

/**
 * Koa 授权中间件
 * 基于 notifyorder 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Object}
 */
async function notifyorderMiddleware (ctx, next) {
    try{
        const result = await notifyorder(ctx.request)
        ctx.state.$orderInfo = {
            data:result
        }
    }
    catch(err){
        ctx.state.$orderInfo = {
            err:err.message}
    }
    next()
}


function originConfig(origin){
    switch (origin) {
        case 0:
            return {
            appid: config.miniProgram.appId,
            mch : config.miniProgram.mch,
            origin}
        case 1:
            return {
            appid : config.platform.appId,
            mch : config.platform.mch,
            origin}
        default:
            return undefined
    }
}

module.exports = {
    unifiedorder,
    unifiedorderMiddleware,
    notifyorder,
    notifyorderMiddleware
}
