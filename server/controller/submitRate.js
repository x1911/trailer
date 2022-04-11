const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const MySQL = require('../model/index')
const MovieModel = MySQL.MovieModel


exports.movieRate = function (req, res) {
    setting.asyncRes(movieRateFunc, '获取影片列表', req, res)
}

async function movieRateFunc(req){
    const parm = core.xssObj(req.body) //提交分数参数
    if(core.isNull( parm.ID )) throw Error('无ID')
    if(core.isNull( parm.rate )) throw Error('无评分')

    let rate = Math.round( parm.rate )
    console.log('提交参数', parm, rate)
    if(!rate) throw Error('评分有误')
    if(rate > 10 || rate < 1) throw Error('评分有误')

    const cond = {
        ID : parm.ID
    }

    rate = "+" + rate
    await MySQL.incr( MovieModel, cond, 'submitRate', rate)     //评分
    await MySQL.incr( MovieModel, cond, 'submitCount')     //提交数量+1
    // console.log('v1,v2', v1, v2)
    return true
}