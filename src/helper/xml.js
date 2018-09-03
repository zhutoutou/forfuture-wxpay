const xml2js = require('xml2js')

const parse = new xml2js.Parser({explicitArray:false})
const builder = new xml2js.Builder({cdata :true});
/**
 * XML序列化
 * @param {Object}          [必填] target          目标对象
 * @returns {String}
 */
function object2XML (target) {
    return builder.buildObject(target,);
}

/**
 * XML反序列化
 * @param {String}          [必填] target            目标对象
 * @returns {Object} 
 */
async function xml2Object(target){
    let res = ''
    try{
     res = await xml2jsSync(target)
    }
    catch(err){
        console.log('xml2Objecterr' + JSON.stringify(err))
    }
    return res
}

function xml2jsSync (target){
    return new Promise((resolve,reject)=>{
        parse.parseString(target,(err,res)=>{
            if(res) resolve(res.xml)
            else reject(err)
    
        })
    })
}

module.exports = {
    object2XML,
    xml2Object
}

