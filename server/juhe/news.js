// 聚合新闻
const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const Redis = require('../core/redis')
const RL = require('../core/redisLock')
// const proxy = require('../core/proxy')
const setting = require('../setting/setting')

    const redisKey = 'news'

exports.news = function (req, res) {
    setting.asyncRes(newsFunc2, '新闻', req, res)
}

async function newsFunc2(req){
    const parm = core.xssObj(req.query)
    parm.type = parm.type || 'top'

    let ans = await cacheGet2( parm.type ) //读内存
    return ans
}



async function newsFunc(req) {
    const parm = core.xssObj(req.query)
    parm.type = parm.type || 'top'

    let ans = await cacheGet( parm.type ) //读内存
    if(ans) return ans

    // const time = Date.now()
    const lock = await addLock() // 2019.12.16 加锁
    ans = await getNewsFunc( parm ) //网络读取
    await cacheSet(parm.type, ans) //缓存内容
    // console.log('获取内容并存储',  Date.now() - time )
    await RL.unlock(lock)  //解锁

    return ans
    // console.log('获取内容', ans)
}

//账户加锁
async function addLock (parm = 'load') {
    // const parm = {
//   userID : userID,
// amount : 1,
// voucher : 2,
// reason : '注册系统收入'
// }
//     parm.accType = parm.accType || 1 //默认普通用户
    const preFix = 'NewsLoading:'
    // const reciverKey = preFix + parm.accType + ':' + parm.userID
    const reciverKey = preFix + parm
    // c.ld('锁key', reciverKey)
    let lock
    try {
        lock = await RL.lock(reciverKey, 5000) //3秒锁
    }
    catch (e){
        c.lge('Lock-error', e)
        throw Error('读取新内容中，待会儿再来吧！')
    }
    return lock
}

async function getNewsFunc2(parm) {
    const top = 'http://c.m.163.com/nc/article/headline/T1348647853363/0-40.html'

    let url = top
    if(parm.type === 'guonei'){
        url = 'http://c.3g.163.com/nc/article/list/T1467284926140/0-40.html'  //精选
    }
    else if(parm.type === 'yule'){
        url = 'http://c.3g.163.com/nc/article/list/T1348648517839/0-20.html' // 娱乐
    }
    else if(parm.type === 'junshi') {
        url = 'http://c.m.163.com/nc/auto/list/5bmz6aG25bGx/0-20.html' // 汽车
    }
    else if(parm.type === 'tiyu') {
        url = 'http://c.3g.163.com/nc/article/list/T1348649079062/0-20.html'  // 体育
    }
    else if(parm.type === 'caijing' || parm.type === 'shishang'){
        url = 'http://c.3g.163.com/nc/article/local/5bmz6aG25bGx/0-20.html'
    }

    const ans = await core.getJSON(url, parm)
    const result = {data : null}
    // console.log('ll', core.Olength(ans))
    for (let i in ans){
        let d = ans[i]
        for (let t of d){  //更新单个内容类型
            t.url = t.url || t.url_3w  //转换类型
            // console.log('ll', d.url, d.url_3w)
            t.thumbnail_pic_s = t.thumbnail_pic_s || t.imgsrc  //转换类型
        }

        result.data = d
    }
    // console.log('传递参数', parm, ans)

    return {result}
}


async function getNewsFunc(parm) {
    // 类型,,top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育)
    // junshi(军事),keji(科技),caijing(财经),shishang(时尚)
    const AppKey = 'c438377c5d6300de5241a5b379c9f24a'
    const url = 'http://v.juhe.cn/toutiao/index'

    parm.key = AppKey
    const ans = await core.getJSON(url, parm)
    // console.log('传递参数', parm, ans)

    return ans
}


// hget 服务器上有性能问题



async function cacheGet(type) {  //从缓存读取
    return await Redis.get( redisKey + type )
}
async function cacheSet(type, ans){
    await Redis.set( redisKey + type, ans, 48000)  //20分钟刷新一次
}

async function cacheGet2(type){  //从缓存读取
    let ans = await Redis.hget( redisKey, type )
    if(!ans) return null
    ans = JSON.parse( ans )
    // const diff = Date.now() - ans.time
    // console.log('时间差', diff, diff > 30000)
    // if( diff > 30000) return null  //超过30秒就重新获取
    return ans
}

async function cacheSet2(type, ans){
    ans.time = Date.now()  //保存时间并存到redis
    const saveAns = JSON.stringify( ans )
    await Redis.hset( redisKey, type, saveAns )
}