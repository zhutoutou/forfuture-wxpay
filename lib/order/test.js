'use strict';

var _require = require('xml2js'),
    parseString = _require.parseString;

var str = '<xml>\n<appid><![CDATA[wx2421b1c4370ec43b]]></appid>\n<attach><![CDATA[\u652F\u4ED8\u6D4B\u8BD5]]></attach>\n<bank_type><![CDATA[CFT]]></bank_type>\n<fee_type><![CDATA[CNY]]></fee_type>\n<is_subscribe><![CDATA[Y]]></is_subscribe>\n<mch_id><![CDATA[10000100]]></mch_id>\n<nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>\n<openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>\n<out_trade_no><![CDATA[1409811653]]></out_trade_no>\n<result_code><![CDATA[SUCCESS]]></result_code>\n<return_code><![CDATA[SUCCESS]]></return_code>\n<sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>\n<sub_mch_id><![CDATA[10000100]]></sub_mch_id>\n<time_end><![CDATA[20140903131540]]></time_end>\n<total_fee>1</total_fee>\n<coupon_fee><![CDATA[10]]></coupon_fee>\n<coupon_count><![CDATA[1]]></coupon_count>\n<coupon_type><![CDATA[CASH]]></coupon_type>\n<coupon_id><![CDATA[10000]]></coupon_id>\n<coupon_fee><![CDATA[100]]></coupon_fee>\n<trade_type><![CDATA[JSAPI]]></trade_type>\n<transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>\n</xml>';

parseString(str, { explicitArray: false }, function (err, res) {
    console.log(res.xml);
});