const c = require('../core/log4js')
const MySQL = require('../model/index')
const MovieModel = MySQL.MovieModel

// 检查并保存数据
async function checkAndSave (mdata) {
  const cond = {doubanID: mdata.doubanID}
  const dd = await MySQL.findOne( MovieModel, cond)
  if(dd){
    c.ld('电影已存在', dd.title)
    return  //找到就返回
  }

  mdata.addTime = Date.now()
  // console.log('存入数据', mdata, typeof mdata)
  await MySQL.save( MovieModel, mdata )
}

exports.checkAndSave = checkAndSave