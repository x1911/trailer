const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const makeToken = require('../core/makeToken')

const MySQL = require('../model/index')
const UserModel = MySQL.UserModel

exports.login = function (req, res) {
    setting.asyncRes(loginFunc, '登录', req, res)
}

async function loginFunc(req, res){

    const parm = core.xssObj( req.body )
    // console.log('登录信息', parm)
    const arr = ['phone', 'password']
    await core.checkNullParm( parm, arr )
    
    // 查询用户
    const cond = { phone: parm.phone }
    const user = await MySQL.findOne(UserModel, cond)
    // console.log('登录信息', user)
    if(!user) throw Error('用户不存在')

    //  对比密码
    const compraPass = await core.bCompare(parm.password, user.password )
    console.log('登录需要对比的两个值', compraPass, parm.password, user.password)
    if (!compraPass) throw Error('密码错误')

    // 收到token
    const token = makeToken.createToken(user.ID, user.phone)

    delete user.password  // 删除密码
    delete user.addTime

    return { ...user, token }  // 返回个人信息和token
}