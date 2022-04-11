
const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
// const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const MySQL = require('../model/index')
const { MovieModel, CommentModel } = MySQL


exports.submitComment = function (req, res) {
    setting.asyncRes(submitCommentFunc, '提交评论', req, res)
}

async function submitCommentFunc(req, res) {
    const parm = core.xssObj(req.body) //提交分数参数
    const arr = ['ID', 'content']
    await core.checkNullParm(parm, arr)

    if (parm.content.length <= 8) throw Error('评论过短')

    // console.log('查看', req.user, parm)
    parm.fromUID = req.user.id

    const cond = { ID: parseInt(parm.ID) }
    const dd = await MySQL.findOne(MovieModel, cond)
    // console.log('查询的电影', cond, dd)
    if (!dd) throw Error('没有这个电影')
    // return 'asdfsaf'


    parm.addTime = Date.now()  // 存时间
    parm.movieID = parseInt( parm.ID )  // 2021.5.14 客户端传的是ID所以这里修改
    delete parm.ID
    await MySQL.save(CommentModel, parm)
    // console.log('评论成功', parm)
    return '评论成功'
}



