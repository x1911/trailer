/**
 * Created by zz on 2017/7/25.
 */

'use strict'
const Sequelize = require('sequelize')
const _ = require('lodash')
const config = require('../setting/config')

const Op = Sequelize.Op
/*
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
}
*/
const sequelize = new Sequelize(
    config.mySQL.name, // 'sample', // 数据库名
    config.mySQL.user, // 'root',   // 用户名
    config.mySQL.password,  // 'zuki',   // 用户密码
  {
    dialect: 'mysql',  // 数据库使用mysql
    host: config.mySQL.host, // 'localhost', // 数据库服务器ip
    port: config.mySQL.port,        // 数据库服务器端口
        // disable logging; default: console.log
    logging: false,  // 不显示查询信息，不利于调试
    dialectOptions: {
      // supportBigNumbers: true, //输入int为number类型，负责为string
      decimalNumbers: true //decimal类型输出成number类型
    },
    // operatorsAliases: operatorsAliases,  // v6版本被取代
    pool: {  // 连接池
      max: 10,
      min: 0,
      idle: 10000
    },
    define: {
            // 字段以下划线（_）来分割（默认是驼峰命名风格）
      'timestamps': false,
      'underscored': false,
      
      // 2022.4.7 新增定义方式，让数据库支持表情
      "charset": "utf8mb4",
      "collate": "utf8mb4_general_ci",
    }
  }
)







// 查找方法
exports.findAll = function (Model, cond) {
  return new Promise(function (resolve, reject) {
    const t = new Date()
        /*
        const cond = {
            // attributes: ['id', 'houseType'], //只查询部分属性
            // offset: 5, limit: 5
            order: [
                // 转义 username 并对查询结果按 DESC 方向排序
                ['id', 'DESC'],
                // 按相关联的User 模型的 name 属性排序
                // [User, 'id', 'DESC'],
            ]
        }
        */
    Model.findAll(cond).then(function (data) {
      data = _.map(data, function (d) {
        return d.dataValues
      })
      const duration = (new Date() - t)
            // console.log('MySQL', 'findAll', cond, (duration + 'ms'));
      if (duration > 500) {
        console.log('MySQL timeout', cond, (duration + 'ms'))
      }
      resolve(data)
    })
            .catch(function (err) {
              reject(Error('MySQL findAll error' + cond + err))
            })
  })// new promise
}

// 查询一个  查不到就返回空
exports.findOne = async function (Model, cond, attributes) {
  const t = new Date()
    // console.log('MySQL findOne没找到值得', cond)
  let findCond = {
    // where: {title: 'aProject'},
    where: cond
    // attributes: ['id', ['name', 'title']]
  }
  if(attributes){
    findCond.attributes = attributes
  }
  const d = await Model.findOne(findCond)
    // console.log('MySQL findOne没找到值得', d)

  const duration = (new Date() - t)
  if (duration > 500) {
    console.log('MySQL findOne timeout', cond, (duration + 'ms'))
  }
  if (d) return d.dataValues

  // console.error('MySQL findOne error:', d)
  return null
        // .then(project => {
        // project will be the first entry of the Projects table with the title 'aProject' || null
        // project.title will contain the name of the project
    // })
}

// 保存数据
exports.save = async function (Model, data) {
  // data格式：
  // {
  //     uid: data._id,
  //         accounttype : type,
  //     realname : data.realname || '',
  //     mobile : data.mobile,
  //     amount: 0,
  // }
  const task = await Model.create( data )
  // task.destroy();  //存入又删除
  // console.log('saveData', task.dataValues)
  if (task) return task.dataValues
  return null
}

exports.save2 = async function (Model, data) {
    // data格式：
    // {
    //     uid: data._id,
    //         accounttype : type,
    //     realname : data.realname || '',
    //     mobile : data.mobile,
    //     amount: 0,
    // }
  const task = Model.build(data)
  let arr = []
  for (let i in data) {
    arr.push(i)
  }
    // console.log('arr内容', arr)
// 将临时变量存入数据库内, 只保存 title 属性
  const tt = await task.save({ fields: arr })
  if (tt) return tt.dataValues
  return null
}


//更新数据
exports.update = async function  (Model, cond, val) {
  // val = {updatedAt: null,} //要更新的内容
  /*
        cond = {rank: {
        $or: {
          $lt: 100,
          $eq: null
        }
      }}
   */
  const tt = await Model.update(val, {
    where: cond
    //// rank < 1000 OR rank IS NULL
  });
  return tt
}



//翻下一页
const getNextPage = async function (parm) {
  const cond = parm.condition || {} // 获取传过来的查询条件

  // if (parm.last) cond.id = { $lt: parm.last } // 翻页小于ID的情况翻页
  if (parm.last) cond.id = { [Op.lt] : parm.last } // 翻页小于ID的情况翻页
  // if (parm.attributes) cond.attributes = parm.attributes // 查询部分属性
  const Model = parm.Model
    // console.log('MYSQL翻页查询条件：：', cond)

  const rr = await getNextPageFunc(Model, cond, parm.attributes)
  return rr
}

// 查找翻页方法
const getNextPageFunc = async function (Model, cond, attributes) {
  const where = {
    where: cond, // 查询条件
    limit: cond.PageCount || 20,  // 每页数量
    order: [
            // 转义 username 并对查询结果按 DESC 方向排序
            ['id', 'DESC']
    ]
  }
  if(attributes){
    where.attributes = attributes //只查询部分属性
  }

  let datas = await Model.findAll(where)
  datas = _.map(datas, function (d) {
    return d.dataValues
  })
  return datas
}
exports.getNextPage = getNextPage

/*
//测试部分
const HouseModel = require('./HouseModel')(sequelize)
// let timecond = parm.timeRange ? TimeFunc.MongoTimeCondition(parm.timeRange) :{}
const TimeFunc = require('../core/TimeFunc')
const condition = TimeFunc.MySQLTimeCondition('thisMonth', 'releaseTime')
condition.province = '广西壮族自治区'
const parm = {
    Model: HouseModel,
    condition : condition,
        // {
        // releaseTime: {
        //     $lt: new Date(),
        //     $gt: new Date(new Date() - (24 * 60 * 60 * 1000) * 30)
        // }
    // },
    // last: '157'
}
getNextPage(parm).then( d => {
    _.map(d , ds => {
        console.log(ds.id, ds.houseTitle, ds.releaseTime)
    })
    console.log('查询结果', d.length)
}) .catch(e => {
    console.error('MySQL get NextPage ::' + e)
})
*/


//事务处理
/*
用法：
async function testFunc () {
    const d = await MySQL.Transaction( async (t) => {
      const saveD1 = {uid: 3333, realname: 'padwd', accounttype: 150}
      const saveD = await MxzlAccountModel.create(saveD1, {transaction:t})
      const saveD2 = {tt:'asdasd',uid: 4444, realname: 'padwd', accounttype: 160}
      const saveDD = await MxzlAccountModel.create(saveD2, {transaction:t})
      // console.log('存储结果返回前', saveD, saveDD)
      // throw Error('回滚尝试', saveD1)
      return {d1 : saveD, d2 : saveDD }
    })
    console.log('存储结果', d)
  return d
}
 */
exports.Transaction = async function (cb) {
  const response = await sequelize.transaction( async (t) => {
    return await cb(t)
  })
  return response
}



//聚合查询，计算数量 总值

exports.sum = async function ( model ) {  //sum(field, [options])-求和
  const result = await model.sum(
    'price',
    {
      attributes:['name'],
      group:'name',
      plain:false,
      having:['COUNT(?)>?', 'name', 1]
    }
    )
  /*
  生成的SQL语句如下
  SELECT `name`, sum(`price`) AS `sum` FROM `orders` AS `Orders` GROUP BY name HAVING COUNT('name')>1;
   */
    console.log('sum result:::', result);
  return result
}

exports.count = async function( Model, cond ) {  //-统计查询结果数
  const result = await Model.count(cond)
  return result
}

//直接输入SQL语句
exports.query = async function (str) {
  const result = await sequelize.query(str)
  return result
}

//增加数值  默认 +1, val必须输入string值
exports.incr = async function (Model, condition, key, val) {
  if(!condition) throw Error('incr 没有条件')
  // someModel.update( { clicks : sequelize.literal( "clicks + 1" ) } )
  val = val || '+1'
  let cond = {}
  const str = key + val
  cond[key] = sequelize.literal( str )
  const selector = {
    where: condition
  };
  const result = await Model.update( cond, selector )
  // console.log('增加结果', cond, result, result.length)
  if (result.length <= 0) return false
  return result[0] === 1
}


exports.MovieModel = require('./MovieModel')(sequelize) // 课程
// exports.UserDataModel = require('./UserData')(sequelize) //用户
exports.UserModel = require('./UserModel')(sequelize) // 用户
exports.CommentModel = require('./CommentModel')(sequelize) // 用户