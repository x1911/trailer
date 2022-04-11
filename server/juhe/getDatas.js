const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const Redis = require('../core/redis')
const RL = require('../core/redisLock')
// const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const redisKey = 'news'


exports.getNews = function (req, res) {
    setting.asyncRes(getAllNewsFunc, '获取新闻数据', req, res)
}

async function getAllNewsFunc() {
    const parms = allTypes()
    // c.ld(parms)
    for(let i of parms){
        const ans = await getNewsFunc( { type: i } )
        if( ans.result.data.length <= 0 ) continue //如果获取回来没有数据
        await cacheSet2( i, ans ) //保存到cache
    }
    return '获取内容数量：' + parms.length
}


function allTypes(){
    const arr = [
        'top', //(头条，默认),
        'shehui' //(社会)
        ,'guonei' //(国内)
        ,'guoji' //(国际)
        ,'yule' //(娱乐)
        ,'tiyu' //(体育)
            ,'junshi' //(军事)
        ,'keji' //(科技)
        ,'caijing' //(财经)
        ,'shishang' //(时尚)
    ]
    // let parr = []
    // for (let i of arr){
    //     parr.push( { type: i } )
    // }
    return arr
}

async function getNewsFunc(parm = {type : 'top'}) {
    // 类型,,top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育)
    // junshi(军事),keji(科技),caijing(财经),shishang(时尚)
    const AppKey = 'c438377c5d6300de5241a5b379c9f24a'
    const url = 'http://v.juhe.cn/toutiao/index'

    parm.key = AppKey
    const ans = await core.getJSON(url, parm)
    // console.log('传递参数', parm, ans)

    return ans
}

// 保存到redis
async function cacheSet2(type, ans){
    ans.time = Date.now()  //保存时间并存到redis
    const saveAns = JSON.stringify( ans )
    await Redis.hset( redisKey, type, saveAns )
}