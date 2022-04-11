const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const MySQL = require('../model/index')
const MovieModel = MySQL.MovieModel

// 用户登录换token
async function _loginFunc(parm){
    // console.log('传入数据', parm)
    const appid = 'wx554d820a7aca48f3'
    const secret = 'f57ac41f89a795008cee1756d7165720'
    // const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${parm.code}&grant_type=authorization_code`
    const url = 'https://api.weixin.qq.com/sns/jscode2session'
    // ?appid=${APPID}&secret=${SECRET}&js_code=${parm.code}&grant_type=authorization_code
    const p = {
        appid, 
        secret,
        js_code: parm.code,
        grant_type: 'authorization_code'
    }
    const ans = await core.getURL( url, p, '1' )
    console.log('微信登录返回数据', parm, ans)
    return ans.text
}






async function mainFunc(req){
    const parm = core.xssObj(req.body) //提交分数参数
    if(core.isNull( parm.type )) throw Error('no type')

    if( parm.type === 'login' ){  // 判断登录
        const ans = await _loginFunc(parm)
        return ans
    }
}

exports.main = function (req, res) {
    setting.asyncRes(mainFunc, '获取用户信息', req, res)
}


