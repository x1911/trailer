/** 问卷调查 */
const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const Redis = require('../core/redis')
const RL = require('../core/redisLock')
const setting = require('../setting/setting')

const redisKey = 'questionnaire'

exports.PostQuestionnaire = function (req, res) {
    setting.asyncRes(PostQFunc, '提交问卷', req, res)
}

async function PostQFunc(req){
    const parm = core.xssObj( req.body )
    const arr = [ 'name', 'ans' ]
    // for( let i of arr ){
    //     const isNull = core.isNull( parm[i] )
    //     if( isNull ) throw Error( '缺少参数' + i )
    // }
    await core.checkNullParm( parm, arr )
    
    const obj = {
        name: parm.name,  // 用户名字
        ans: parm.ans,
        time : Date.now(),  //保存时间并存到redis
    }
    if( parm.avatar ) obj.avatar = parm.avatar
    
    const saveAns = JSON.stringify( obj )
    await Redis.hset( redisKey, parm.name, saveAns )
    return '您的信息已经保存'
    
}


exports.GetQuestionnaire = function (req, res) {
    setting.asyncRes( GetQFunc, '获取问卷', req, res)
}

async function GetQFunc(req){
    // const parm = core.xssObj( req.query )
    // const arr = [ 'name' ]
    // await core.checkNullParm( parm, arr )
    // const list = await Redis.hget( redisKey, parm.name )
    const list = await Redis.hgetall( redisKey )
    // console.log('获得de ', list)
    return list
}