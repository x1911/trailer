const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')
const InfoCheck = require('../core/InfoCheck')

const MySQL = require('../model/index')
const UserModel = MySQL.UserModel

exports.reg = function (req, res) {
    setting.asyncRes(regFunc, '注册', req, res)
}

async function regFunc(req, res){
    const parm = core.xssObj( req.body )
    // console.log('注册内容', parm)
    const arr = ['name', 'phone', 'password']
    await core.checkNullParm( parm, arr )  // 检查空参数

    const isPhone = InfoCheck.isPhoneNrCorrect( parm.phone )
    if(!isPhone) throw Error('电话号码不正确')
    
    const isPassOk = InfoCheck.isPasswordValidat( parm.password )
    // console.log('密码是否合乎要求', isPassOk)
    if( !isPassOk ) throw Error('密码要求不正确')
    
  // 检查是否已存在
    const cond = {phone: parm.phone}
    const dd = await MySQL.findOne( UserModel, cond)
    if(dd){
      throw Error('电话已存在')
    }

    // 加密用户名
    parm.password = await core.bHash(parm.password)
    // console.log('第二次bHash加密', req.body.password, parm.password)
    parm.addTime = Date.now()  // 存入时间

    // console.log('新加用户存入数据', parm, typeof parm)
    await MySQL.save( UserModel, parm )  // 保存到数据库

    return '注册成功'
}