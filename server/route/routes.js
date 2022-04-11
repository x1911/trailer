const connectionLimit = require('../core/connectionLimit')

const movieList = require('../controller/movieList')
const submitRate = require('../controller/submitRate')
const userInfo = require('../controller/userInfo')

const getDatas = require('../juhe/getDatas')
const juheNews = require('../juhe/news')

const reg = require('../user/reg')
const { login } = require('../user/login')
const auth = require('../user/auth')
const { submitComment } = require('../controller/submitComment')
const { commentOne } = require('../controller/CommentList')
const { weather } = require('../juhe/weather')
const { PostQuestionnaire, GetQuestionnaire } = require('../juhe/questionnaire')

module.exports = function (app) {
  connectionLimit.GETLimit(app) //限制访问刷新频率

  // 聚合数据
  app.get('/getNews', getDatas.getNews) //获取新闻数据
  app.get('/news', juheNews.news) //新闻
  
  app.get('/weather', weather) //天气api
  app.post('/postQuest', PostQuestionnaire)  // 提交调查数据
  app.get('/getQuest', GetQuestionnaire)   // 获取所有调查

  app.get('/movieList', movieList.getMovieList) //列表
  app.get('/movieOne', auth.signinRequired, movieList.getOneMovie) //单片
//   app.get('/testRef', movieList.testRef) //转发

  app.post('/movieRate', auth.signinRequired, submitRate.movieRate) //提交分数
  app.post('/userInfo', auth.signinRequired, userInfo.main) //微信登录数据验证
  
  app.post('/addComment', auth.signinRequired, submitComment)  // 提交评论 
  app.get('/commentOne', auth.signinRequired, commentOne)  // 评论列表 


  // 用户 ==============================
  app.post('/s/reg', reg.reg) //登录注册等
  app.post('/s/login', login) //登录注册等
  app.post('/s/auth', auth.signinRequired, auth.check) //验证
  // app.post('/t/tLogin', thud.userLogin)
  // app.post('/t/logout', thud.signinRequired, stud.logout)
}