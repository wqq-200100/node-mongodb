import cheerio from "cheerio";
import https from "https";
// let url = "mongodb://localhost:27017/";

async function requseUrlToHtml(url, fn) {
    let html = ''
    https.get(url, (res) => {
        res.on('data', data => html += data)
        res.on('end', () => {
            const $ = cheerio.load(html)
            fn($)
        })
    })
}

// 获取书的章节和链接
/*function getBookTxt(novelTitle, novelHref, sort) {
    let bookDataList = []
    let info = []
    requseUrlToHtml(`https://${novelHref}`, $ => {
        $('.book-dir:nth-child(3) a ,.main').each((index, element) => {
            //这一个遍历是不是可以取到所有的章节链接
            // 把所有链接存到一个数组
            const el = $(element)
            let chapter = el.find('.name').text() //章节名
            let chapterHref = el.attr('href') // 章节链接
            let updata = el.find('.book-update span').text() // 更新信息
            let tag = el.find('.book-tags .tag').text() // 小说类型
            let total = el.find('.book-total div').text() // 评分、收藏、赞赏
            let copy = el.find('.copy-right ').text() // 版权

            bookDataList.push({
                name: chapter,
                href: chapterHref
            })
            info.push({
                updata,
                tag,
                total,
                copy
            })
        })
        // getNovelContext(novelTitle, bookDataList, sort)
        console.log(info[0])
    })
}*/

// 获取小说内容，并写入文件夹
/*function getNovelContext(novelTitle, bookDataList, sort) {
    let k = 0
    const t = setInterval(() => {
        requseUrlToHtml(`https://${bookDataList[k].href}`, $ => {
            const content = $('#article p').text()

            let updata = el.find('.book-update span').text() // 更新信息
            /!*fs.writeFile(`./${sort}/${novelTitle}/${bookDataList[k].name}.txt`, content, {
                encoding: "utf8",
            }, err => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`${sort}-${novelTitle}-${bookDataList[k].name} 写入完成`)
                }
            })*!/
            k++
            if (k === bookDataList.length) clearInterval(t)
        })
    }, 1000)
}*/

/*function mkdir(bookHref, bookTitle, sort) {
    // fs.stat检测文件夹是否存在，不存在则报错，然后创建这个文件夹
    /!*fs.stat(sort, err => {
        if (err) fs.mkdirSync(sort)
    })
    fs.stat(`${sort}/${bookTitle}`, err => {
        if (err) fs.mkdirSync(`${sort}/${bookTitle}`)
    })*!/
    getBookTxt(bookHref, bookTitle, sort)
}*/

/*
requseUrlToHtml('https://book.qq.com/book-rank/male-free', $ => {
    const sort = $('.ypc-column-name').text() //排行榜小说目录
    $('.ypc-list .book-large,rank-book ').each((index, element) => {
        const el = $(element)
        let bookTitle = el.find('.title,ypc-link').text() //小说名
        let bookHref = el.find('.wrap').attr('href') // 小说链接
        let bookImg = el.find('.book .ypc-book-cover').attr('src') // 小说图片
        let intro = el.find('.content .intro').text() // 简介
        let other = el.find('.other span').text() // 作者、类型、字数
        getBookTxt(bookTitle, bookHref, sort)
    })
})
*/


export {requseUrlToHtml}
