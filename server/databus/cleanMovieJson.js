const path = require('path')
const _ = require('lodash')
const core = require('../core/core')
// const core2 = require('../core/core2')
const movieDetail = require('../crawl/movieDetail')
const fileName = 'movielist'

let moveList = []  // 片子列表
let ids = [] //存数据ids
let trailers = [] // 预告片列表

const start = 0  //从第几个开始抓取trailers
let count = 50 //一共抓几个

async function run(moveListData){
  moveList = moveListData || await loadData()  //读取
  if(moveListData){  //根据是否传入数据，决定抓几个
    count = moveListData.length
  }
  clean()  //清洗


  if(moveList.length <= 0 || !moveList[0]) {
    throw Error('没有片源数据')
  }

  let idArr = []
  // for(let i=0; i<moveList.length; i++){
  for(let i=start; i<(start+count); i++){  //从特定的位置开始获取
    idArr.push( ids[i] )
  }
  idArr = reOrder( idArr )  //重新排列

  // console.log('查询片源', idArr.length, idArr)
  trailers = await movieDetail.getTrailers(idArr) //获取视频链接
  // console.log('传入idArr数量', idArr.length, trailers)

  removeNoTrailer() //删除空预告的电影
  mergenTrailers() //组合预告片和本身内容

  /*
    { video:
     'http://vt1.doubanio.com/201907052352/9e09828de3c7c405a492c661aa353c37/view/movie/M/402480749.mp4',
    doubanID: 26931786,
    cover:
     'https://img3.doubanio.com/img/trailer/medium/2560046305.jpg?1560949911',
    title: '蜘蛛侠：英雄远征',
    rate: 8,
    poster:
     'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2558293106.jpg' } ]
   */
  return trailers //传回组合的内容
}

// run().then()
exports.run = run




async function loadData(){
  const filePath = path.join(__dirname, 'backup/' + fileName + '.json')
  let data = await core.fsRead( filePath )
  data = JSON.parse(data)
  // console.log('json数据长度', data.length)
  return data
}

function clean () {
  // console.log('清洗前长度', moveList.length)
  moveList = _.uniqBy(moveList, (e) => { //数据唯一
    // console.log('唯一', e)
    return e.title;
  });
  console.log('清洗后长度', moveList.length)
  // return data

  ids = moveList.map( d => {  //单独存ID
    return d.doubanID
  })
}

function reOrder(datas) {
  // console.log('重新排序前', datas)

  // 以 `user` 升序排序 再  `age` 以降序排序。
  // moveList = _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
  // moveList = _.orderBy(moveList, ['doubanID'], ['asc']); //按ID顺序存入

  datas = _.sortBy(datas, function (d) {
    return -d
  })
  // console.log('重新排序后', datas)
  return datas
}


//删掉没有预告片的电影
 function removeNoTrailer () {
  // trailers = trailers.map( d => {
  //   if(d.video) return d
  // })
  for( let i = 0; i < trailers.length; i++){  //删除数组中没有预告的部分
    if ( !trailers[i].video ) {
      trailers.splice(i, 1);
      i--;
    }
  }
  // console.log('去掉无预告片：', trailers.length, trailers)
}


function mergenTrailers () {  //合并原本的数据到获取到的内容
  trailers = trailers.map( d => {
    let mov
    for(let i=0; i<moveList.length; i++){
      mov = moveList[i]
      if(mov.doubanID !== d.doubanID) continue
      break
    }
    d = _.extend( d, mov)  //合并两个data
    return d
  }) //map

  // console.log('合并后的内容', trailers.length, trailers)
}