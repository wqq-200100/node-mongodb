import {MongoClient} from "mongodb";
import {requseUrlToHtml} from "./UrlToHtml.js";
import https from "https";

let url = "mongodb://localhost:27017/";


// 图片转base64格式
function imgUrl2Base64(url, fn) {
    https.get(url, function (res) {
        let chunks = [];
        let size = 0;
        res.on('data', function (chunk) {
            chunks.push(chunk);
            size += chunk.length;　　//累加缓冲数据的长度
        });
        res.on('end', function (err) {
            let data = Buffer.concat(chunks, size);
            let base64Img = data.toString('base64');
            fn(base64Img)
        });
    });
}

// 处理评分
function totalHandle(sotalStr) {
    let a = sotalStr.replace(/\s+/g, '').replace(/(\d\.\d)分(\d+)人评分.*?(\d+).*?(\d+).+/, '$1,$2,$3,$4').split(',')
    return a
}

function main() {
    MongoClient.connect(url, (err, db) => {
        const myDB = db.db('pa-chong')
        try {
            myDB.collection('免费榜').drop()
        } catch (e) {
            console.log(e, 'drop err')
        }

        let sort
        // 连接数据库
        requseUrlToHtml('https://book.qq.com/book-rank/male-free', $ => {
            sort = $('.ypc-column-name').text() //排行榜小说目录
            $('.ypc-list .book-large,rank-book ').each((index, element) => {
                const el = $(element)
                let bookTitle = el.find('.title,ypc-link').text() //小说名
                let bookHref = el.find('.wrap').attr('href') // 小说链接
                let bookImg = el.find('.book img').attr('src') // 小说图片
                let intro = el.find('.content .intro').text() // 简介
                let other = el.find('.other span').text() // 作者、类型、字数
                getBookTxt(bookHref, bookTitle)
                let table = myDB.collection(sort)
                imgUrl2Base64(bookImg, (base64) => {  // 将图片转base64
                    table.insertOne({
                        title: bookTitle,
                        href: bookHref,
                        baseimg: base64,
                        intro: intro,
                        other: other,
                        data: []
                    })
                })
            })
        })

        // 获取书的章节和链接
        function getBookTxt(novelHref, novelTitle) {
            let bookDataList = []
            requseUrlToHtml(`https://${novelHref}`, $ => {
                let update = $('.main .book-update span').text() // 更新信息
                let tag = $('.main .book-tags .tag').text() // 小说类型
                let total = $('.main .book-total div').text() // 评分、收藏、赞赏
                let copy = $('.main .copy-right ').text() // 版权
                // bookInfo.push({updata, tag,total,copy,novelTitle})
                const table = myDB.collection(sort)
                table.updateOne({title: novelTitle}, {
                    $set: {
                        update,
                        tag,
                        total: totalHandle(total),
                        copy
                    }
                })
                $('.book-dir:nth-child(3) a').each((index, element) => {
                    //这一个遍历是不是可以取到所有的章节链接,把所有链接存到一个数组
                    const el = $(element)
                    let chapter = el.find('.name').text() //章节名
                    let chapterHref = el.attr('href') // 章节链接
                    bookDataList.push({
                        name: chapter,
                        href: chapterHref
                    })
                })
                getNovelContext(novelTitle, bookDataList)
            })
        }

        // 获取小说内容
        function getNovelContext(novelTitle, bookDataList) {

            bookDataList.forEach(({name, href}) => {
                requseUrlToHtml(`https://${href}`, $ => {
                    const content = $('#article p').text()
                    const table = myDB.collection(sort)
                    const cid = Number.parseInt(name.replace(/第(\d+)章.+/, '$1'))
                    table.updateOne({title: novelTitle}, {
                        $push: {
                            "data": {
                                cid,
                                chapterName: name,
                                content
                            }
                        }
                    })
                })
            })

        }
    });
}

main()


