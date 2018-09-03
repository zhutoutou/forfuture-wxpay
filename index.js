const config = require('./config')
const debug = require('debug')('wxpay-sdk[init]')
let { ERRORS ,ORDER_ORIGIN} = require('./lib/constants')

/**
 * 初始化 qcloud sdk

 * SDK 所有支持的配置项
 * @param {object} [必须] configs                    配置信息

 * @param {object} [必须] configs.rootPathname       程序运行对应的根路径

 * @param {string} [可选] configs.miniProgram        微信小程序 配置信息
 * @param {string} [可选] configs.miniProgram.appId  微信小程序 App ID
 * @param {string} [可选] configs.miniProgram.appSecret          
 *                                                   微信小程序 App Secret

 * @param {object} [必须] configs.mysql              MySQL 配置信息
 * @param {string} [必须] configs.mysql.host         MySQL 主机名
 * @param {string} [可选] configs.mysql.port         MySQL 端口（默认3306）
 * @param {string} [必须] configs.mysql.user         MySQL 用户名
 * @param {string} [必须] configs.mysql.db           MySQL 数据库
 * @param {string} [必须] configs.mysql.pass         MySQL 密码
 * @param {string} [可选] configs.mysql.char         MySQL 编码

 * @param {string} [必须] configs.mch                商户 配置信息
 * @param {string} [必须] configs.mch.mch_id         商户唯一标识
 * @param {string} [可选] configs.mch.notify_url     商户下单通知网络地址
 * @param {string} [必须] configs.mch.fee_type       商户收款货币类型
 * @param {string} [必须] configs.mch.sign_type      加密方式

 * @param {string} [必须] configs.serverHost         服务器 Host
 */
module.exports = function init (options) {
    // 检查配置项
    const { rootPathname , serverHost, mch ,miniProgram,platfrom} = options
    if ([rootPathname, serverHost,mch].some(v => v === undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_CONFIG)

    if (![miniProgram, platfrom].some(v => v !== undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_CONFIG)

    // const {appId,appSecret} = miniProgram
    // if ([appId, appSecret].some(v => v === undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_CONFIG)

    const { mch_id, fee_type, sign_key,notify_url } = mch
    if ([mch_id, fee_type,sign_key,notify_url].some(v => v === undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_CONFIG)

    if (options.mysql) {
        const { host, port, user, db, pass } = options.mysql
        if ([host, port, user, db, pass].some(v => v === undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_MYSQL_CONFIG)
    }

    // 初始化配置
    const configs = config.set(options)

    debug('using config: %o', configs)

    return {
        config,
        mysql: require('./lib/mysql'),
        order: require('./lib/order')
    }
}
