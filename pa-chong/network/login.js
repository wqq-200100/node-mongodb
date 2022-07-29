import express from 'express'
import {MongoClient} from "mongodb";

export const login = express.Router()
let url = "mongodb://localhost:27017/";
// 注册
login.post('/api/register', async (req, res) => {
    console.log(req.body)
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('user')
        const hasUser = await table.findOne({
            username: req.body.username
        })
        if (hasUser) {
            res.send('用户已存在')
        } else {
            const interUserOK = await table.insertOne({
                username: req.body.username,
                password: req.body.password
            })
            if (interUserOK) {
                res.send('用户创建成功')
            } else {
                res.send('用户创建失败')
            }
        }
    })
})

// 登录
login.post('/api/login', async (req, res) => {
    MongoClient.connect(url, async (err, db) => {
        const myDB = db.db('pa-chong')
        const table = myDB.collection('user')
        const token = Math.random().toString(36) // 随机生成token

        const isRight = await table.findOne({
            username: req.body.username,
            password: req.body.password,
        })
        if (isRight) {
            await table.updateOne({
                username: req.body.username,
                password: req.body.password,
            }, {
                $set: {
                    token
                }
            })
            res.send({
                msg: '登录成功~',
                token
            })
        } else {
            res.send('登录失败！！')

        }
    })
})

