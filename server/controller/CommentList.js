const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')
const MySQL = require('../model/index')
const { CommentModel, UserModel } = MySQL

//  获取单个电影的评论
exports.commentOne = function (req, res) {
    setting.asyncRes(commentOneFunc, '查看评论', req, res)
}

async function commentOneFunc(req, res) {
    const parm = core.xssObj(req.query) //提交分数参数
    const arr = ['ID']
    await core.checkNullParm(parm, arr)
    const ans = await getOneComment( parm.ID )
    return ans
}




async function getOneComment(ID) {
    
    // 查询
    const where = { movieID: parseInt( ID ) }
    const cond = {
        where,
        order: [
            ['ID', 'ASC']
        ]
    }
    const cc = await MySQL.findAll(CommentModel, cond)  // 获取评论列表

    // 获取用户姓名和头像
    const IDs = cc.map(d => {  // 获取所有的作者列表
        return d.fromUID
    })
    const cond2 = {  // 搜索多个ID
        where: { ID: IDs },
        attributes: ['ID', 'name', 'avatar'], //只查询部分

    }
    const ulist = await MySQL.findAll(UserModel, cond2)

    // console.log('显示搜索列表', cc, ulist)
    // 合并数据
    const ans = cc.map(d => {
        for (let i of ulist) {
            if (i.ID !== d.fromUID) continue
            d.name = i.name
            d.avatar = i.avatar
            return d
            // break
        }
    })

    // console.log('合并过的结果', ans)
    return ans

}

// 2021.5.11 导出给单个电影用
exports.getOneComment = getOneComment