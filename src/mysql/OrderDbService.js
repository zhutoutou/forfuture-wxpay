const debug = require('debug')('qcloud-sdk[AuthDbService]')
const uuidGenerator = require('uuid/v4')
const moment = require('moment')
const {ERRORS,ORDER_STATE} = require('../constants')
const mysql = require('./index')

/**
 * 储存订单信息
 * @param {object} orderInfo 
 * @return {string}
 */
async function initOrderInfo (orderInfo,origin) {
     try{
        const order_info = JSON.stringify(orderInfo)
        const out_trade_no = uuidGenerator().replace(/-/g, "")
        const state = ORDER_STATE.INIT
        const open_id = orderInfo.openid
        const init_time = moment().format('YYYY-MM-DD HH:mm:ss')
        await mysql('cOrder').insert({
            order_info,
            out_trade_no ,
            open_id, 
            state, 
            init_time,
            origin
        })
        return out_trade_no
     } catch(e){
        debug('%s: %O', ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB, e)
        throw new Error(`${ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB}\n${e}`)
     }
}

/**
 * 更新订单信息
 * @param {string} prepay_id 
 * @param {string} out_trade_no 
 * @return {void}
 */
async function unifiedOrderInfo(prepay_id, out_trade_no){
    try{
        
        const res = await mysql('cOrder').count('out_trade_no as hasOrder').where(
            {out_trade_no}
        )
        if(!res[0].hasOrder) throw new Error(`${ERRORS.DBERR.ERR_NO_ORDER_FOUND}\nout_trade_no:${out_trade_no}`)
        const unified_time = moment().format('YYYY-MM-DD HH:mm:ss')
        const state = ORDER_STATE.UNIFIED
        await mysql('cOrder').update({
            prepay_id,
            state,
            unified_time
        }).where(
            {out_trade_no}
        )
    } catch(e){
       debug('%s: %O', ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB, e)
       throw new Error(`${ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB}\n${e}`)
    }
}

/**
 * 查找来源信息
 * @param {string} out_trade_no 
 * @return {void}
 */
async function findOriginInfo(out_trade_no){
    try{
        const findRes = await mysql('cOrder').select('cOrder.origin').where(
            {out_trade_no}
        ).first()
        if(!findRes) throw new Error(`${ERRORS.DBERR.ERR_NO_ORDER_FOUND}\nout_trade_no:${out_trade_no}`)
        const {origin} = findRes
        return origin
    } catch(e){
       debug('%s: %O', ERRORS.DBERR.ERR_WHEN_SELECT_TO_DB, e)
       throw new Error(`${ERRORS.DBERR.ERR_WHEN_SELECT_TO_DB}\n${e}`)
    }
}

/**
 * 更新订单信息
 * @param {string} prepay_id 
 * @param {string} out_trade_no 
 * @return {void}
 */
async function notifyOrderInfo(out_trade_no){
    try{
        
        const res = await mysql('cOrder').count('out_trade_no as hasOrder').where(
            {out_trade_no}
        )
        if(!res[0].hasOrder) throw new Error(`${ERRORS.DBERR.ERR_NO_ORDER_FOUND}\nout_trade_no:${out_trade_no}`)
        const notify_time = moment().format('YYYY-MM-DD HH:mm:ss')
        const state = ORDER_STATE.NOTIFY
        await mysql('cOrder').update({
            state,
            notify_time
        }).where(
            {out_trade_no}
        )
    } catch(e){
       debug('%s: %O', ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB, e)
       throw new Error(`${ERRORS.DBERR.ERR_WHEN_UPDATE_TO_DB}\n${e}`)
    }
}

module.exports = {
    initOrderInfo,
    unifiedOrderInfo,
    notifyOrderInfo,
    findOriginInfo
}
