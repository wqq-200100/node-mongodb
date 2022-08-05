import {MongoClient} from "mongodb";
import express from 'express'
import cors from "cors";
import {login} from "./login.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use(login)

let url = "mongodb://localhost:27017/";
MongoClient.connect(url, (err, db) => {
    const myDB = db.db('pa-chong')
    const mianFeiTable = myDB.collection('免费榜')
    const userTable = myDB.collection('user')


    // 获取榜单所有小说信息
    app.get('/commend', async (req, res) => {
        await mianFeiTable.find({})
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

// 通过小说名查询小说详情
    app.get('/commend/info', async (req, res) => {
        const {title} = req.query
        const data = await mianFeiTable.findOne({title}, {
            projection: {
                data: 0,
            }
        })
        // projection 过滤需要的字段1 就是要返回  0 不要返回
        res.send(data)

    })

// 通过小说名查询小说章节
    app.get('/chapterName', async (req, res) => {
        const {title} = req.query
        const data = await mianFeiTable.findOne({title}, {
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

// 通过章节查内容
    app.get('/chapter', async (req, res) => {
        const {title, cid} = req.query
        // 把章节名改成章节id 或者章节数 如：1  就是第一章
        const k = 0
        const data = await mianFeiTable.findOne({title})
        let d = data.data.filter(i => i.cid === Number.parseInt(cid))[0]
        if (d) {
            res.send(d)

        } else {
            res.send('没有找到该章节')
        }

    })

// 模糊搜索
    app.get('/search', async (req, res) => {
        const str = `.*${req.query.title}.*`
        const reg = new RegExp(str)

        const a = await mianFeiTable.find({
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

    app.get('/addLike', async (req, res) => {
        let {user_id, title} = req.query
        const likes = await userTable.findOne({user_id}, {project: {likes: 1}}).likes || []
        const hasThisBook = likes.indexOf(title) !== -1
        if (hasThisBook) {
            res.send('已经收藏')
        } else {
            userTable.updateOne({_id: user_id}, {
                $push: {
                    likes: {title}
                }
            })
        }
    })


    app.listen(8080,'192.168.102.2', () => {
        console.log('api serve running at http://127.0.0.1:8080')
    })
})

