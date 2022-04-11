'use strict'
const Sequelize = require('sequelize')

module.exports = function (sequelize) {
    return sequelize.define(
        // 默认表名（一般这里写单数），生成时会自动转换成复数形式
        // 这个值还会作为访问模型相关的模型时的属性名，所以建议用小写形式
        'user',
        // 字段定义（主键、created_at、updated_at默认包含，不用特殊定义）
        {
            'ID': {
                'type': Sequelize.INTEGER, // 字段类型
                'allowNull': false,         // 是否允许为NULL
                // 'unique': true,              // 字段是否UNIQUE
                'primaryKey': true,
                'autoIncrement': true  //自增ID，写了才返回
            },
            agentID: Sequelize.INTEGER,  // 代理ID
            school: {  //报考学校
                'type': Sequelize.STRING,
                // 'allowNull': false
            },
            //   rate: Sequelize.DOUBLE,  //评价

            major: Sequelize.STRING,  //专业
            name: Sequelize.STRING,  //封面
            avatar: Sequelize.STRING,  //头像
            password: Sequelize.STRING,  // trailer 地址
            IDNo: Sequelize.STRING,  // trailer 地址
            phone: Sequelize.STRING,  // trailer 地址
            cSchool: Sequelize.STRING,  // trailer 地址

            addTime: Sequelize.DATE,  //存入时间
            editTime: Sequelize.DATE,  //修改时间
            isAgent: Sequelize.INTEGER,  // 是否代理

        }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        // don't delete database entries but set the newly added attribute deletedAt to the current date (when deletion was done). paranoid will only work if timestamps are enabled
        paranoid: true,

        // don't use camelcase for automatically added attributes but underscore style so updatedAt will be updated_at
        // underscored: true,

        // disable the modification of tablenames; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural. if you don't want that, set the following
        freezeTableName: true

        // define the table's name
        // tableName: 'mxzl_housebasicinfo'
    }
    )
}
