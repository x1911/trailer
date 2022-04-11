const c = require('../core/log4js')

exports.DEBUG = false

exports.set = {
  serverToken : '123'
}

// 统一返回成功
const successjson = function (res, data = {}) {
  const jsondata = {success: 1, msg: data}
  return res.status(200).json(jsondata)
}
exports.successjson = successjson
// 统一返回错误数据
const errorjson = function (res, code, explication) {
  // if(setting.DEV) code = 200;
  if( explication && typeof explication === 'object'){
    // console.log('错误类型', typeof explication)
    explication = explication.message || explication
  }
  explication = explication || 'unknown error'

  explication = explication.replace(/Error/, '')  //替换掉Error的提示
  return res.status(code).json({
    success: 0,
    code: code,
    msg: explication
  })
}
exports.errorjson = errorjson


//打包返回内容的用法
function asyncRes (Func, reason, req, res) {
  Func(req, res).then(function (data) {
    successjson(res, data)
  }).catch(function (err) {
    // c.lge(reason + '失败', err)
    console.error(reason + '失败', err)
    errorjson(res, 200, reason + '失败：' + err)
  })
}
exports.asyncRes = asyncRes