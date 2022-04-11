/**
 * 后台主入空
 * Created by zz on 16/7/26.
 */


const express = require('express');
const path = require('path');
const http = require('http');
http.globalAgent.maxSockets = 10000
const app = express();
const compression = require('compression') // gzip 压缩
app.use(compression())
const history = require('connect-history-api-fallback');  // 支持vue历史模式
// const opt = {
//     rewrites: [
//         { from: /^\/abc$/, to: '/' }
//       ]
// }
app.use(history())
// const session = require('express-session');
//将回话session存入数据库,用户不用重复登录
// const MongoStore = require('connect-mongo')(session);

/*
// 连接数据库
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
const DBUrl = require('./setting/config').mongoDB
mongoose.connect(DBUrl, {
  config: { autoIndex: false },
  useMongoClient: true,
});
*/


const bodyParser = require('body-parser'); //解析body,需要npm另外安装



//使用静态文件服务器中间键
// app.use(express.static(path.join(__dirname,'app','public')));
app.use(express.static(path.join(__dirname,'../','client')));
// 可以解析body后就能解析json, 所有请求 content-type application/json
app.use(bodyParser.json());
// 解析post在body中传的参数,所有请求 application/x-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//session会话
/*
app.use(session({
    secret:'SDDSD',//对回话进行加密
    resave:true, //次数重存
    saveUninitialized: true,//是否保存为初始化,必须要
    cookie:{
        maxAge:60*60*100 //有效期
    },
    store:new MongoStore({
        url:DBUrl
    })
}));
*/


//设置跨域访问
app.all('*', function(req, res, next) {
  //todo:正式环境需要修改绑定固定域名
  //// Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, LoginToken");
  // 允许GET、POST、DELETE请求
  // res.header("Access-Control-Allow-Methods","POST,GET,DELETE");
  // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By",' 3.2.1')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// 路由
require('./route/routes')(app);//导入路由下的解释

//错误处理
// process.on('uncaughtException', function (err) {
//     console.log(date(),' 服务端错误 ',err);
// })
// 监听端口
// app.listen(3000);
const port = 555
const server = http.createServer(app)


// 2021.3.20
// const io = require('./io/Server')
// const gameServer = io.create(server)

// 20201.4.18 给小程序的服务端
const websocket = require('./websocket/Server')
websocket.Server( server )


// gameServer.listen(port, function () {  // 用gameserver启动没有port
server.listen(port, function () {
  console.log('服务器启动在 %i', port, new Date().toLocaleString());
  // require('./privateLib/core2').cleanCount()
});