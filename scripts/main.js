const fetch = require('node-fetch')
const puppeteer = require('puppeteer')
const fs = require('fs')

async function getTile(id, key, path, writePath) {
    const baseUrl = `http://tile217.gigapan.org/gigapans0/${id}/tiles.${key}`
    const resp = await fetch(`${baseUrl}/${path}`)
    await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream('./img.png')
        resp.body.pipe(fileStream)
        resp.body.on('error', reject)
        resp.body.on('finish', resolve)
    })
}

async function main() {
    console.log('begin main')
    await getTile('217593', 'b75d4c508ce0fa815e299b16ad550bd1', 'r01/r01302.jpg')
    console.log('done main')
}

main()
