const {signKey} = require('../../config')
const {signObject} = require('../helper/sign')
async function signMiddleware(ctx,next){
    const params = ctx.selfParams
    const _sign = params.sign   // 约定签名参数

    if(_sign === signObject(params,signKey,'sign').sign){
        await next()
    } else {
        ctx.state = {
            code :-1,
            data :{
                msg:'签名验证失败'
            }
        }
    }
}

module.exports = {
    signMiddleware
}