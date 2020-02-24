const mergeImg = require('merge-img');
const Canvas = require('canvas');
const fs = require('fs')
const path = require('path')

async function main() {
    try {
        const img = await mergeImg([
            path.resolve(__dirname, './test-images/body.png'),
            path.resolve(__dirname, './test-images/eyes.png'),
            path.resolve(__dirname, './test-images/mouth.png')
        ])
        img.write('out.png', () => console.log('done writing'))
        // const b64 = await mergeImages(['./test-images/body.png', './test-images/eyes.png', './test-images/mouth.png'], {
        //     Canvas: Canvas
        // })
        // fs.writeSync('./test-images/face.png', b64)

        
    } catch(err) {
        console.log(err)
    } finally {
        console.log('end')
    }
}
main()
