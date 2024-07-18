# forfutre-wxpay 服务端SDK - Node.js

## 介绍

forfuture 服务端SDK是自己封装的微信支付的快速开发库提供以下的功能供小程序开发者快速调用：

* 统一下单

* 获取微信订单信息

## 安装

`npm intstall forfuture-wxpay --save`

## 配置

```javascript
const configs = {
  platform:{
    appId: 'wx00dd00dd00dd00dd',
    appSecret: 'abcdefghijkl',
    mch: {
      mch_id: 'mch00dd00dd00dd00dd',
      fee_type: 'CNY',
      sign_type: 'md5'
    }
  }
}
const forfuture-wxpay = require('forfuture-wxpay')(configs)
```

## 基本功能

### 统一下单

用户统一下单使用 unifiedorder 接口：

```javascript
const { order: { unifiedorder } } = forfuture-wxpay

// express
module.exports = (req, res) => {
  unifiedorder(req).then(result => {
    // result :{
    //      out_trade_no,           订单号
    //      prepay_id:res.prepay_id 预付款ID
    //}
  })
}
