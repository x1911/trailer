const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')
const makeToken = require('../core/makeToken')

exports.auth = function (req, res) {
    setting.asyncRes(authFunc, '登录', req, res)
}

async function authFunc(req, res) {
    // let tokenData = req.headers['x-access-token']
    // console.log('阿双方都撒到发顺丰', tokenData)
    // tokenData = core.xss(tokenData)
    // if (tokenData === null || tokenData === undefined || tokenData === '') {
    //   const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //   console.log('check传过来的token为空', tokenData, fullUrl)
    //   return null
    // }
    // tokenData = core.Base64.decode(tokenData) //base64解一层
    // const d = await validate(tokenData) // 有token就检验合法，通过就返回用户名

    const t = await makeToken.check(req)
    // console.log('验证结果', t)
    if (!t) { throw Error('请登录')    }
    req.user = t //存token验证后的信息
    return 'success'
}

// 用户中间键 判断是否登录
exports.signinRequired = function (req, res, next) {
    authFunc(req).then(function () {
        next() // 验证登录通过
    }).catch(function (err) {
        return setting.errorjson(res, 450, '没有登录：' + err)
    })
}


exports.check = function( req, res){
    setting.asyncRes(checkFunc, '检查', req, res)
}

async function checkFunc(req){
    if( req.user ) return 'success'
    else return 'lost'
}