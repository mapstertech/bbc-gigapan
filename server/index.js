require('dotenv')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const fetch = require('node-fetch')
const fs = require('fs')
const FS = require('./lib/FileSystem')
const Utils = require('./lib/Utils')
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
        const pathToImage = path.resolve(__dirname, `./images/${id}/${r1}.jpg`)
        const tileNum = Utils.getGigapanTileNumber(Number(id))
        fs.stat(pathToImage, async (err, stat) => {
            if (err === null) {
                res.sendFile(pathToImage) // serve local
            } else if (err.code === 'ENOENT') {
                const resp = await fetch(`http://tile${tileNum}.gigapan.org${req.path}`) // download from gigapan
                resp.body.pipe(res) // pipe to HTTP response
                const fileStream = fs.createWriteStream(pathToImage) // pipe to write stream for later usage
                resp.body.pipe(fileStream)
            } else {
                res.sendStatus(500)
            }
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
})

app.get('/gigapans0/:id/tiles.:authKey/:r1/:r2.jpg', (req, res, next) => {
    try {
        const { id, authKey, r1, r2 } = req.params
        const pathToImage = path.resolve(__dirname, `./images/${id}/${r1}/${r2}.jpg`)
        const tileNum = Utils.getGigapanTileNumber(Number(id))
        fs.stat(pathToImage, async (err, stat) => {
            if (err === null) {
                return res.sendFile(pathToImage) // serve local
            } else if (err.code === 'ENOENT') {
                const resp = await fetch(`http://tile${tileNum}.gigapan.org${req.path}`) // file does not exist -- download from gigapan
                const respCopy = resp.clone() // needed b/c data is flushed after piping to response
                resp.body.pipe(res) // pipe to HTTP response
                const pathToFolder = path.resolve(__dirname, `./images/${id}/${r1}`)
                const gigaIdFolderExists = await FS.doesFileExistAsync(pathToFolder)
                if (gigaIdFolderExists) {
                    const fileStream = fs.createWriteStream(pathToImage)
                    respCopy.body.pipe(fileStream)
                } else {
                    await FS.createFileAsync(pathToFolder, { recursive: true })
                    const fileStream = fs.createWriteStream(pathToImage)
                    respCopy.body.pipe(fileStream)
                }
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
        const { id, authKey, r1, r2, r3 } = req.params
        const pathToImage = path.resolve(__dirname, `./images/${id}/${r1}/${r2}/${r3}.jpg`)
        const tileNum = Utils.getGigapanTileNumber(Number(id))
        fs.stat(pathToImage, async (err, stat) => {
            if (err === null) {
                return res.sendFile(pathToImage) // serve local
            } else if (err.code === 'ENOENT') {
                const resp = await fetch(`http://tile${tileNum}.gigapan.org${req.path}`) // file does not exist -- download from gigapan
                const respCopy = resp.clone() // needed b/c data is flushed after piping to response
                resp.body.pipe(res) // pipe to HTTP response
                const pathToFolder = path.resolve(__dirname, `./images/${id}/${r1}/${r2}`)
                const gigaIdFolderExists = await FS.doesFileExistAsync(pathToFolder)
                if (gigaIdFolderExists) {
                    const fileStream = fs.createWriteStream(pathToImage)
                    respCopy.body.pipe(fileStream)
                } else {
                    await FS.createFileAsync(pathToFolder, { recursive: true })
                    const fileStream = fs.createWriteStream(pathToImage)
                    respCopy.body.pipe(fileStream)
                }
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
