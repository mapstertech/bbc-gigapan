require('dotenv')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const PORT = process.env.PORT || 4000
const morganSetting = process.env.NODE === 'production' ? 'prod' : 'dev'
const app = express()

app.use(cors())
app.use(morgan(morganSetting))

// app.get('/gigapans0/217593/tiles.b75d4c508ce0fa815e299b16ad550bd1/r00')
app.get('/gigapans0/:id/tiles.:authKey/:r1.jpg', async (req, res, next) => {
    try {
        const { id, authKey, r1 } = req.params
        const absolutePath = path.resolve(__dirname, `./images/${id}/${r1}.jpg`)
        fs.stat(absolutePath, async (err, stat) => {
            if (err === null) {
                // serve local
                res.sendFile(absolutePath)
            } else if (err.code === 'ENOENT') {
                // download from gigapan
                const resp = await fetch(`http://tile217.gigapan.org${req.path}`)
                // pipe to HTTP response
                resp.body.pipe(res)
                // pipe to write stream for later usage
                const fileStream = fs.createWriteStream(absolutePath)
                resp.body.pipe(fileStream)
            } else {
                res.sendStatus(500)
            }
            return
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
})

app.get('/gigapans0/:id/tiles.:authKey/:r1/:r2.jpg', (req, res, next) => {
    try {
        const { id, authKey, r1, r2 } = req.params
        const absolutePath = path.resolve(__dirname, `./images/${id}/${r1}/${r2}.jpg`)
        fs.stat(absolutePath, async (err, stat) => {
            if (err === null) {
                // serve local
                return res.sendFile(absolutePath)
            } else if (err.code === 'ENOENT') {
                // file does not exist -- download from gigapan
                const resp = await fetch(`http://tile217.gigapan.org${req.path}`)
                // pipe to HTTP response
                resp.body.pipe(res)
                // pipe to write stream for later usage
                const pathToGigaId = path.resolve(__dirname, `./images/${id}`)
                fs.stat(pathToGigaId, (err, stat) => {
                    if (err === null) {
                        const fileStream = fs.createWriteStream(absolutePath)
                        resp.body.pipe(fileStream)
                        return
                    } else if (err.code === 'ENOENT') {
                        // fs.mkdirSync(pathToBackupRecs, { recursive: true })
                        fs.mkdir(pathToGigaId, { recursive: true }, (err) => {
                            if (err) {
                                return res.send(500)
                            } else {
                                const fileStream = fs.createWriteStream(absolutePath)
                                resp.body.pipe(fileStream)
                                return                                        
                            }
                        })
                    } else {
                        return res.sendStatus(500)
                    }
                })
            } else {
                return res.sendStatus(500)
            }
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
})

app.get('/gigapans0/:id/tiles.:authKey/:r1/:r2/:r3.jpg', (req, res, next) => {
    try {
        const { id, authKey, r1 } = req.params
        const absolutePath = path.resolve(__dirname, `./images/${id}/${r1}.jpg`)
        fs.stat(absolutePath, async (err, stat) => {
            if (err === null) {
                // serve local
                return res.sendFile(absolutePath)
            } else if (err.code === 'ENOENT') {
                // download from gigapan
                const resp = await fetch(`http://tile217.gigapan.org/gigapans0/${id}/tiles.${authKey}/${r1}.jpg`)
                // pipe to HTTP response
                resp.body.pipe(res)
                // pipe to write stream for later usage
                const fileStream = fs.createWriteStream(absolutePath)
                resp.body.pipe(fileStream)
                return
            } else {
                return res.sendStatus(500)
            }
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
})

app.listen(PORT, () => {
    console.log(`bbc-gigapan server running on port ${PORT}`)
})
