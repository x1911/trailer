const path = require('path')
const core0 = require('../core/core')
const movieList = require('./movieList')
const cleanMovieJson = require('../databus/cleanMovieJson')

const saveData = require('../databus/saveData')

async function ML () {  //前期批量抓取
  const html = await movieList.init(6) //抓前20页数据
  console.log('获取movielist完毕', html)
  // const list = await handleListData(html)
  // const list = await handleListData(htmlEnd)
  // console.log('处理movielist完毕', list)
  await backup(html)
}
async function backup(data){
  const name = 'movielist'
  const json = JSON.stringify(data);  //转换成json格式
  const savepath = path.join(__dirname, 'backup/' + name + '.json')
  // use fs to write the file to disk
  await core0.fsWrite( savepath, json);

  console.log('备份数据保存完成, 文件是：', savepath)
}


// ML().then()

async function getTrailersAndSave () {
  const html = await movieList.init() //抓前2页数据
  console.log('获取movielist 抓前多页数据 完毕', html)
  if(!html) throw Error('抓取网页内容异常')
  const datas = await cleanMovieJson.run(html)  //放入获取回来的文件 不放就是备份的
  // const datas = await cleanMovieJson.run()  //放入获取回来的文件 不放就是备份的
  console.log('输出包含预告片的数值', datas.length)

  /*
  const datas = [ { video:
     'http://vt1.doubanio.com/201907062312/fb6a36a21f365e7e44dea29beb36a37b/view/movie/M/402480749.mp4',
    doubanID: 26931786,
    cover:
     'https://img3.doubanio.com/img/trailer/medium/2560046305.jpg?1560949911',
    title: '蜘蛛侠：英雄远征',
    rate: 8,
    poster:
     'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2558293106.jpg' } ]
  */

  for( let i=0; i<datas.length; i++){  //存抓取的内容
    await saveData.checkAndSave( datas[i] )
  }
  console.log('写入完成', datas.length)
}  //getTrailersAndSave

getTrailersAndSave().then()

/*
// 暂时弃用
const cheerio = require('cheerio');
let $ = null
const $Func = function (html) {
  $ = cheerio.load(html, {
    ignoreWhitespace: true,
    xmlMode: false,
    lowerCaseTags: false
  });
}

async function handleListData(html) {
  let links = []

  $Func(html); //获取到整个网页
  const items = $('a')
  // console.log('items', items)
  items.each( (index, item) => {
    // const img = $(item).find('img').attr('src')
    // console.log(img)

    let it = $(item)
    let doubanId = it.find('div').data('id')
    let title = it.find('.title').text()
    let rate = Number(it.find('.rate').text())
    let poster = it.find('img').attr('src').replace('s_ratio', 'l_ratio')

    links.push({
      doubanId,
      title,
      rate,
      poster
    }) //links.push
  })
  return links
}
*/




