require('dotenv')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const sharp = require('sharp')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const fs = require('fs')
const FS = require('./lib/FileSystem')
const Utils = require('./lib/Utils')
const path = require('path')
const PORT = process.env.PORT || 4000
const morganSetting = process.env.NODE === 'production' ? 'prod' : 'dev'
const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan(morganSetting))
app.use('/dzis', express.static(path.resolve(__dirname, './dzis')))

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

app.post('/merged-image', async (req, res, next) => {
    try {
        if (!req.body.img) {
            res.status(400).send({ msg: 'img field is required' })
            return
        }
        if (!req.body.name) {
            res.status(400).send({ msg: 'name field is required' })
            return
        }
        // slice this part off: "data:image/png;base64,"
        const imgBuffer = Buffer.from(req.body.img.slice(22), 'base64')
        sharp(imgBuffer)
            .png()
            .tile({ size: 512 })
            .toFile(`./server/dzis/${req.body.name}.dz`, (err, info) => {
                console.log('err, info', err, info)
                if (err) {
                    res.sendStatus(500)
                    return
                } else {
                    res.status(201).send({ dzi: `${req.body.name}.dz` })
                    return
                }
            })
    } catch(err) {
        console.log(err)
        next(err)
    }
})

app.listen(PORT, () => {
    console.log(`bbc-gigapan server running on port ${PORT}`)
})
