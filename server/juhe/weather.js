// 高德天气
const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const Redis = require('../core/redis')
const RL = require('../core/redisLock')
// const proxy = require('../core/proxy')
const setting = require('../setting/setting')

// const url = 'https://webapi.amap.com/maps'
const url = 'https://restapi.amap.com/v3/weather/weatherInfo'
const  key = '1a2608e65857dd590a4a2079fb287ab1'
// const securityJsCode = '737672c0b750c78a6a476cb3ced3898c'
const redisKey = 'weather'

exports.weather = function (req, res) {
    setting.asyncRes(weatherFunc, '天气', req, res)
}

/** 从高德获取未来三天的天气 */
async function weatherFunc( req ){
    const pp = core.xssObj( req.query )
    const {city = '450100'} = pp
    // console.log('传入参数', city)
    // const city = '450100'  // 南宁地区
    const cache = await cacheGet2( city )   // 判断是否有在缓存中
    if( cache ) return cache
    
    const parm = {
        // v: '2.0',
        key,
        // securityJsCode,
        city,   
        extensions: 'all'
    }
    const ans = await core.getJSON( url, parm )
    // const ans = await core.getURL( url, parm )
    console.log('收到信息', ans)
    await cacheSet2( city, ans )
    return ans
}


async function cacheGet2(type){  //从缓存读取
    const time = 20 * 60 * 1000   // 20分钟才获取一次
    let ans = await Redis.hget( redisKey, type )
    if(!ans) return null
    ans = JSON.parse( ans )
    const diff = Date.now() - ans.time
    console.log('时间差', diff, '是否返回缓存', diff <= time, '缓存剩余时间', (time - diff)/1000)
    if( diff > time) return null  //超过30秒就重新获取
    return ans
}

async function cacheSet2(type, ans){
    ans.time = Date.now()  //保存时间并存到redis
    const saveAns = JSON.stringify( ans )
    await Redis.hset( redisKey, type, saveAns )
}