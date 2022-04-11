// 豆瓣电影详情页
// const core0 = require('../privateLib/core')
// const core = require('../privateLib/core2')

const ml = require('./movieList')

const base = `https://movie.douban.com/subject/`

let page
let ids = []
let dataArr = []

async function getTrailers(idArr){
  // pageCount = page || pageCount //根据内容抓取内容
  ids = idArr
  await ml.startCrawl('http://movie.douban.com', getDetail)
  // return htmlData
  return dataArr
}
exports.getTrailers = getTrailers
// getTrailers([ 3025375, 3025376 ]).then()

async function getDetail (pageData) {  //根据数组获取多个trailers
  page = pageData
  let datas = []
  for(let i=0; i<ids.length; i++){
    const tds = ids[i]
    const dds = await detailPage( tds )
    if(dds){ //有内容就存
      datas.push(dds)
    }
  }
  // console.log('获得内容', datas)
  dataArr = datas
}

async function  detailPage (doubanID) {

  page.setDefaultNavigationTimeout(60000)  // 修改超时时间
  await page.goto(base + doubanID, {
    waitUntil: 'networkidle2'
  })

  let result = {}
  try {

    result = await page.evaluate(() => {
      let $ = window.$
      let it = $('.related-pic-video')

      if (it && it.length > 0) {
        let link = it.attr('href')
        // 正则表达式提取style里的地址
        let backgroud = it.attr('style')
        let regex = /.*\(([^)]*)\)/
        let cover = backgroud.match(regex)[1]
        return {
          link,
          cover
        }
      }
      return {}
    })
  }
  catch (e) {
    console.error('没有网页内容', result)
    return null //没有内容就返回
  }


  let video
// console.log('ss', result)

  if (result.link) {
    await page.goto(result.link , {
      waitUntil: 'networkidle2'
    })
    // await sleep(2000)

    video = await page.evaluate(() => {
      let $ = window.$
      let it = $('source')

      if (!it && it.length <= 0) {
        // return it.attr('src')
        return null
      }

      // return ''
        return it.attr('src')
    })
  }

  const data = {
    video,
    doubanID,
    cover: result.cover
  }
  // console.log('单片内容', result)
  return data
}