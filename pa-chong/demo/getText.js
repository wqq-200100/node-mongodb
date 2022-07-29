import https from "https";
import cheerio from "cheerio";
import fs from "fs";

export default async function getText(txtUrl, bookTitle,title) {
    https.get(`https:${txtUrl}`, (res => {
        let html = ''
        res.on('data', (d)=>{
            html += d
        })
        res.on('end', ()=>{
            const $ = cheerio.load(html)
            let txt = $('#article').text()
            console.log(txt)
            // fs.stat检测文件夹是否存在，不存在则报错，然后创建这个文件夹
            fs.stat(title, err=>{
                if (err) fs.mkdirSync(title)
            })
            fs.stat(`${title}/${bookTitle}`, err=>{
                if (err) fs.mkdirSync(`${title}/${bookTitle}`)
                console.log(`${title}/${bookTitle}`)
            })

            fs.writeFile(`./${title}/${bookTitle}`, txt, {
                encoding: "utf8",
            }, err=>{
                if (err) console.log(err)
            })
        })
    }))
}
