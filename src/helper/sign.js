const md5 = require('md5')

/**
 * 对对象进行加密算法
 * @param {String} key 
 * @param {String} signPerporty 
 */
Object.prototype.sign = function(key,signPerporty){
    signPerporty = signPerporty || 'sign'
    let sortArr = Object.keys(this).sort()
    let stringSignTemp = ''
    sortArr.map((v)=> {
    if(v.key != signPerporty) {
        stringSignTemp += `${v.key}=${v.value}&` 
        }
    })
    if(key) stringSignTemp += `&key=${key}` 
    this[signPerporty] = (md5(stringSignTemp)).toUpperCase()
}

