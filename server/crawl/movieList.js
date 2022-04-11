// 豆瓣电影列表页
const core2 = require('../core/core2')

// sort U 近期热门 R 最新上映
const url = `https://movie.douban.com/tag/#/?sort=R&range=5,10&tags=%E7%94%B5%E5%BD%B1`

// https://movie.douban.com/j/new_search_subjects?sort=U&range=5,10&tags=%E7%94%B5%E5%BD%B1&playable=1&start=0
const ajax = 'https://movie.douban.com/j/new_search_subjects?sort=U&range=5,10&tags=%E7%94%B5%E5%BD%B1&playable=1&start=60'



// let data = null //返回内容
let pageCount = 3  // 单次读取长度
// let skipCount = 120  // 跳过内容

let page
let htmlData  //存获取的html内容



async function init() {
  // pageCount = page || pageCount //根据内容抓取内容
  await startCrawl(url, getList)
  // console.log('抓取完成', htmlData)
  return htmlData
}


async function startCrawl(openurl, cb) {
  const option = {
    url: openurl,
    // userAgent: proxy,
    headless: false,
    timeout: 30000,
    emulate: false,  //不模拟移动端
  }
  await core2.browserView(option, cb)  //浏览器打开页面
}
exports.startCrawl = startCrawl  //输出打开页面

async function getList(pageData) {
  page = pageData
  // 监听 点击弹出的确认信息
  page.on('dialog', async dialog => {
    console.log('Alert消息: ', dialog.message())
    await dialog.dismiss()
    // await browser.close();
  })


  await getMorePage(pageCount)
  console.log('getMorePage完毕获取')

  // await core2.sleep(1)
  // htmlData = await getMovieHTML()
  htmlData = await getMoiveList()
  console.log('点击完毕获取列表', htmlData)

  // await core2.sleep(300)
}


//  中间function =========================================
async function getMorePage(num = 4) { //点击加载多少次
  for (let i = 0; i < num; i++) {
    console.log('跳入点击', page.window, i, num)
    const isPageOk = await clickNextPage()
    if (!isPageOk) break //点击失败
    
    if (i !== 0) { // 不是第一次要等读取
      // page.waitForRequest(ajaxLink, {})
      // await core2.sleep(3)

      try {  //尝试等待，超时就继续
        await page.waitForRequest(req => { // watch ajax requests, 检测异步读取
          // console.log('等待结果', req.url(), req.method())
        }, { timeout: 4000 })
        // await core2.sleep(3)  //每次点完等1秒
      }
      catch (e) {
        console.error('结果', e)
      }

      
      await page.evaluate(_ => {  //滚动到最底下
        // console.log('window.innerHeight', window.innerHeight)
        window.scrollBy(0, window.innerHeight * (2 + i));
      })
      // await _scrapeInfiniteScrollItems(page, 5000)  // 滚动到底部
      

      // } //if
      // if( i === (num-1)){
      //   console.log('最后一次滚动', i)
      // await core2.autoScroll(page)  // 滚动到最底部
    }
  } // for
}


// 滚动到底部的函数
async function _scrapeInfiniteScrollItems( page, scrollDelay = 1000 ) {
  // let items = [];
  try {
    let previousHeight;
    // while (items.length < itemTargetCount) {
      // items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      // await page.waitFor(scrollDelay);
      await page.waitForTimeout(scrollDelay);
    // }
  } catch(e) { }
  // return items;
}

async function clickNextPage() {  //点击加载更多
  try {
    const getClick = await page.$('body #app a.more');
    // const html = await page.evaluate( body => body.innerHTML, getClick); //查查找到的内容
    // console.log(html)
    // await page.evaluate(_ => {
      // window.scrollBy(0, window.innerHeight * 2);
    // })
    await _scrapeInfiniteScrollItems(page, 1000)  // 滚动到底部
    // await core2.autoScroll(page)  // 滚动到最底部
    // await getClick.click({delay: 100})  //找到"加载更多"并点击
    await getClick.tap()  //找到"加载更多"并点击
    return true
  }
  catch (e) {
    console.error('没有网页内容：' + e)
    return null
  }
}








// 获取列表中内容
async function getMovieHTML() {
  // console.log('列表中内容00')
  const movieList = await page.$('div.list-wp') //列表div
  // console.log('列表中内容', movieList.length)
  const html = await page.evaluate(body => body.innerHTML, movieList); //查查找到的内容
  // console.log(html)
  return html
}

// 姜获得的内容直接砖换成列表内容
async function getMoiveList() {
  try {
    const result = await page.evaluate(() => {
      let $ = window.$
      let items = $('.list-wp a')
      let links = []

      if (items.length >= 1) {
        items.each((index, item) => {

          // if(index <= skipCount) continue //console.log('跳过的内容', index)
          let it = $(item)
          let doubanID = it.find('div').data('id')
          let title = it.find('.title').text()
          let rate = Number(it.find('.rate').text())
          let poster = it.find('img').attr('src').replace('s_ratio', 'l_ratio')

          links.push({
            doubanID,
            title,
            rate,
            poster
          })
        })
      }

      return links
    })
    return result
  }
  catch (e) {  //获取判断抓取是否成功
    return null
  }
}



exports.init = init
