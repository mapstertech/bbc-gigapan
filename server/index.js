require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const sharp = require('sharp')
const Busboy = require('busboy')
const AWS = require('aws-sdk')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const formidable = require('formidable')
const fs = require('fs')
const FS = require('./lib/FileSystem')
const Utils = require('./lib/Utils')
const path = require('path')
const PORT = process.env.PORT || 4000
const morganSetting = process.env.NODE === 'production' ? 'prod' : 'dev'
const app = express()

app.use(cors())
// app.use(bodyParser.json({
//     limit: '50mb'
// }))
// app.use(bodyParser.urlencoded({
//     extended: true
// }))
app.use(morgan(morganSetting))
app.use('/dzis', express.static(path.resolve(__dirname, './dzis')))
// set AWS credentials
AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE
})

app.get('/gigapans0/:id/tiles.:authKey/:r1.jpg', async (req, res, next) => {
    try {
        const {
            id,
            authKey,
            r1
        } = req.params
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
        const {
            id,
            authKey,
            r1,
            r2
        } = req.params
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
                    await FS.createFileAsync(pathToFolder, {
                        recursive: true
                    })
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
        const {
            id,
            authKey,
            r1,
            r2,
            r3
        } = req.params
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
                    await FS.createFileAsync(pathToFolder, {
                        recursive: true
                    })
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
            res.status(400).send({
                msg: 'img field is required'
            })
            return
        }
        if (!req.body.name) {
            res.status(400).send({
                msg: 'name field is required'
            })
            return
        }
        // slice this part off: "data:image/png;base64,"
        const imgBuffer = Buffer.from(req.body.img.slice(22), 'base64')
        sharp(imgBuffer)
            .png()
            .tile({
                size: 512
            })
            .toFile(`./server/dzis/${req.body.name}.dz`, (err, info) => {
                console.log('err, info', err, info)
                if (err) {
                    res.sendStatus(500)
                    return
                } else {
                    res.status(201).send({
                        dzi: `${req.body.name}.dz`
                    })
                    return
                }
            })
    } catch (err) {
        console.log(err)
        next(err)
    }
})

// these two endpoints were just for testin AWS uploads with streams
app.get('/upload', function(req, res) {
    return res.send(`
        <h1>Upload a stitched together panorama here</h1>
        <form action="fileUploadGP" method="post" enctype="multipart/form-data">
            <input type="file" name="gp"><br>
            <input type="submit">
        </form>
    `)
})

app.post('/fileUploadGP', (req, res, next) => {
    const form = formidable({
        multiples: true,
        maxFileSize: 300 * 1024 * 1024
    })
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err)
        } else {
            if (files.gp) {
                sharp(files.gp.path)
                    .png()
                    .tile({
                        size: 512
                    })
                    .toFile(`./server/dzis/${files.gp.name}.dz`, (err, info) => {
                        if (err) {
                            console.log(err)
                            res.status(500).send(err)
                        } else {
                            res.status(201).send({
                                dzi: `http://localhost:4000/dzis/${files.gp.name}.dzi`
                            })
                            // now send to S3 and return the S3 address
                        }
                    })
            } else {
                res.sendStatus(400)
            }
        }
    })
})

// using busboy and streams. Did not work
// app.post('/fileUploadGP', function(req, res) {
//     const busboy = new Busboy({
//         headers: req.headers
//     })
//     busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//         // const bucketParams = {
//         //     Bucket: 'bbcga',
//         //     Key: `gigapan-dev/${filename}`,
//         //     Body: file
//         // }
//         // const s3 = new AWS.S3
//         // s3.upload(bucketParams, (err, data) => {
//         //     if (err) {
//         //         return res.sendStatus(500)
//         //     } else {
//         //         return res.send(data)
//         //     }
//         // })
//         const convertToDzi =
//             sharp()
//             .png()
//             .tile({
//                 size: 512
//             })
//             // .toFormat('dz')
//         const pathTofile = path.resolve(__dirname, `./dzis/${filename}.dzi`)
//         const dest = fs.createWriteStream(pathTofile)
//             file.pipe(convertToDzi).pipe(dest)
//             file.on('finish', () => res.sendStatus(201))
//             file.on('error', (e) => console.error(e))
//     })

//     return req.pipe(busboy)
// })

app.listen(PORT, () => {
    console.log(`bbc-gigapan server running on port ${PORT}`)
})
