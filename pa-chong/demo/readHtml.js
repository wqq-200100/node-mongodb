import cheerio from "cheerio";
import https from "https";
import getText from "./getText.js";

// 三个参数  路径  编码格式 回调函数
https.get('https://book.qq.com/book-detail/820809', {
    headers: {}
}, (res) => {
    // res.setEncoding('utf-8');
    // console.log(res)
    let html = ''
    res.on('data', data => html += data)
    res.on('end', () => {
    //     console.log(html)
    //     fs.writeFile('t', html, err => console.log(err))
        const $ = cheerio.load(html)
        const bookArray = []
        const title = $('.book-info .book-title').text(), // 书名
            writer = $('.book-info .book-update').text(), //作者
            intro = $('.intro').text() // 简介

        $('.book-dir:nth-child(3) a').each((index, element) => {
            const el = $(element)
            let chapter = el.find('p').text(), //章节名
                chapterHref = el.attr('href') // 章节链接
                bookArray.push({name: chapter, href: chapterHref})
            getText(chapterHref, chapter, title)
        })
    })
})

