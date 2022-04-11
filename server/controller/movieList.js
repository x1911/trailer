
const _ = require('lodash')
const c = require('../core/log4js')
const core = require('../core/core')
const proxy = require('../core/proxy')
const setting = require('../setting/setting')

const MySQL = require('../model/index')
const MovieModel = MySQL.MovieModel

const CommentList = require('./CommentList')

exports.getMovieList = function( req, res ){
  setting.asyncRes(getMovieListFunc, '获取影片列表', req, res)
}

async function getMovieListFunc( req ){
  const parm = core.xssObj(req.query)
  const cond = {
    // 'video',
    attributes: ['ID', 'title', 'cover', 'submitCount' ], //只查询部分数据
    Model: MovieModel,
    PageCount: 20  //一次20条数据
  }
  if(parm.last){ //216,  //下一页
    cond.last = parm.last
  }

  let list = await MySQL.getNextPage(cond)
  list = mapExtraPicLink(list)
  // c.ld('能让人', list.length, list)
  return list
}

//处理图片链接
function mapExtraPicLink (list) {
  list = _.map( list, d => {
    d = addExtraPicLink( d )
    return d
  })
  return list
}

function addExtraPicLink (d) { //给海报加上额外链接，方便访问
  if(d.poster){
    d.poster = 'http://images.weserv.nl/?url=' +  d.poster
  }
  return d
}

// getMovieListFunc({query:{}}).then()


// 获取单片
exports.getOneMovie = function(req, res){
  setting.asyncRes(getOneMovieFunc, '获取单个电影', req, res)
}

async function getOneMovieFunc( req ){
  const parm = core.xssObj(req.query)
  if(core.isNull(parm.ID)) throw Error('no ID')
  const cond = {
    ID: parm.ID
  }
  let one = await MySQL.findOne( MovieModel, cond)
  delete one.doubanID //删除豆瓣ID
  one = addExtraPicLink( one ) //给海报加链接
  // console.log('单片：：', one, cond)

  // 2021.5.11 读取评论
  const comments = await CommentList.getOneComment( parm.ID )
  one.comments = comments

  return one
}
// getOneMovieFunc({query:{ID: '235'}}).then()


exports.testRef = function (req, res) {
  testRefFunc(req, res).then()
}
async function testRefFunc (req, res) {
  //todo: 检查参数等
  proxy.proxy(res)  //转发
}

