const fs = require('fs')

module.exports = {
    createWriteStream: fs.createWriteStream,
    doesFileExistAsync(path, options = {}) {
        return new Promise((resolve, reject) => {
            fs.stat(path, options, (err, stat) => {
                if (err === null) {
                    resolve(true)
                } else if (err.code === 'ENOENT') {
                    resolve(false)
                } else {
                    reject(err)
                }
            })
        })    
    },
    createFileAsync(path, options) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, options, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    statAsync(path, options) {
        return new Promise((resolve, reject) => {
            if (options) {
                fs.stat(path, options, (err, stat) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(stat)
                    }
                })
            } else {
                fs.stat(path, (err, stat) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(stat)
                    }                    
                })
            }
        })
    }   
}
