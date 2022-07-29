import {MongoClient} from "mongodb";
import express from 'express'
import cors from "cors";
const app = express()
import {login} from "./login.js";
app.use(cors())
app.use(express.json())
app.use(login)

let url = "mongodb://localhost:27017/";

// 获取榜单所有小说信息
app.get('/commend', (req, res) => {
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('免费榜')
        await table.find({})
            .project({
                title: 1,
                intro: 1,
                other: 1,
                baseimg: 1,
            })  // 过滤字段
            .limit(10) //分页 只显示10条
            .toArray((err, r) => {
                // res就是查询得到的数据 保留需要的数据
                res.send(r)
            })
    })
})

// 通过小说名查询小说详情
app.get('/commend/info', (req, res) => {
    const {title} = req.query
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('免费榜')
        const data = await table.findOne({title}, {
            projection: {
                data: 0,
            }
        })
        // projection 过滤需要的字段1 就是要返回  0 不要返回
        res.send(data)
    })
})

// 通过小说名查询小说章节
app.get('/chapterName', (req, res) => {
    const {title} = req.query
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('免费榜')
        const data = await table.findOne({title}, {
            project: {
                data: 1
            }
        })
        const newData = data.data.map(item => ({
            chapterName: item.chapterName,
            cid: item.cid,
            content: item.content
        })).sort((a, b) => a.cid - b.cid)
        res.send(newData)
    })
})

// 通过章节查内容
app.get('/chapter', (req, res) => {
    const {title, cid} = req.query
    // 把章节名改成章节id 或者章节数 如：1  就是第一章
    const k = 0
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('免费榜')
        const data = await table.findOne({title})
        let d = data.data.filter(i => i.cid === Number.parseInt(cid))[0]
        if (d) {
            res.send(d)

        } else {
            res.send('没有找到该章节')
        }
        /*        // for of实现
                /!*for (const item of data.data) {
                    if (item.chapterName === chapterName) {
                        res.send(item.content)
                    }
                }*!/

                // for in 实现
                /!*for (let i in data.data ){
                    if(data.data[i].chapterName === chapterName){
                      res.send(data.data[i])
                    }
                }*!/

                // map实现 有返回值
                /!*const datas = data.data.map((i)=>{
                    if(i.chapterName === chapterName) return i.content
                })
                res.send(datas.filter(i=>i))*!/

                // forEach实现 没有返回值
              /!*  const datas = data.data.forEach(i => {
                    if (i.chapterName === chapterName) res.send(i.content)
                })*!/

                // for实现
                /!*for (let i = 0; i < data.data.length;i++) {
                    if(data.data[i].chapterName === chapterName) res.send(data.data[i].content)
                }
                res.send('no data')*!/*/
    })
})

// 模糊搜索
app.get('/search', (req, res) => {
    const str = `.*${req.query.title}.*`
    const reg = new RegExp(str)
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('免费榜')
        const a = await table.find({
            title: {
                $regex: reg
            }
        }, {
            projection: {
                title: 1,
                intro: 1,
                other: 1,
                baseimg: 1,
            }
        }).toArray()
        res.send(a)
    })
})

app.listen(8080, () => {
    console.log('api serve running at http://127.0.0.1:8080')
})
