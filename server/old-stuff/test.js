const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function main() {
    try {
        const rsPath = path.resolve(__dirname, './server/panos/ptgui-panorama.tif')
        const wsPath = path.resolve(__dirname, './server/panos/ptgui-panorama.dzi')
        const rs = fs.createReadStream(rsPath)
        const ws = fs.createWriteStream(wsPath).on('finish', () => console.log('done!'))
        
        const convertJpgToDzi = 
            sharp()
            .tile()
            // .toBuffer()
        rs.pipe(convertJpgToDzi).pipe(ws)
    } catch(err) {
        console.log(err)
    }
}
main()
