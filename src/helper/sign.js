const md5 = require('md5')

/**
 * 对对象进行加密算法
 * @param {String} key 
 * @param {String} signPerporty 
 */
// Object.prototype.sign = function(key,signPerporty){
//     signPerporty = signPerporty || 'sign'
//     let sortArr = Object.keys(this).sort()
//     let stringSignTemp = ''
//     sortArr.map((v)=> {
//     if(v != signPerporty && this[v]) {
//         stringSignTemp += `${v}=${this[v]}&` 
//         }
//     })
//     if(key) stringSignTemp += `key=${key}` 
//     this[signPerporty] = (md5(stringSignTemp)).toUpperCase()
//     return this
// }
module.exports = {signObject}

function signObject(target,key,signPerporty){
    signPerporty = signPerporty || 'sign'
    let sortArr = Object.keys(target).sort()
    let stringSignTemp = ''
    sortArr.map((v)=> {
    if(v != signPerporty && target[v]) {
        stringSignTemp += `${v}=${target[v]}&` 
        }
    })
    if(key) stringSignTemp += `key=${key}` 
    target[signPerporty] = (md5(stringSignTemp)).toUpperCase()
    return target
}