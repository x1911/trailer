'use strict'
const Sequelize = require('sequelize')

module.exports = function (sequelize) {
    return sequelize.define(
        'comment',

    // 字段定义（主键、created_at、updated_at默认包含，不用特殊定义）
    {
        'ID': {
          'type': Sequelize.INTEGER, // 字段类型
          'allowNull': false,         // 是否允许为NULL
          // 'unique': true,              // 字段是否UNIQUE
          'primaryKey': true,
          'autoIncrement': true  //自增ID，写了才返回
        },
        movieID:{   // 恢复的电影ID
            'type': Sequelize.INTEGER,
            'allowNull': false,         // 是否允许为NULL
            'primaryKey': true,
        },
        movieType: Sequelize.INTEGER,  // 分类
        content: {  //内容
            'type': Sequelize.STRING,
            // 'allowNull': false
        },
        fromUID: Sequelize.INTEGER,  //提交人
        toUID: Sequelize.INTEGER,  //回复人

  
        addTime: Sequelize.DATE,  //存入时间
  
        //   submitRate: Sequelize.INTEGER,  //提交分数
        //   submitCount: Sequelize.INTEGER,  //提交数量
  
      }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
  
        paranoid: true,
  
        // underscored: true,
  
        freezeTableName: true

      }

    )
}