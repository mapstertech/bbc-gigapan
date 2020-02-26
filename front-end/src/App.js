import React, { Component } from 'react';
import openseadragon from 'openseadragon'
import mergeImages from 'merge-images'
import Grid from './components/Grid'

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            img: null,
            grid: this.makeGrid(2, 2),
            osd: null
        }
    }

    updateFiles = ({ x, y }, files) => {
        const src = URL.createObjectURL(files[0])
        const img = new Image()
        img.onload = (e) => {
            const { height, width } = e.target
            const grid = [...this.state.grid]
            grid[y][x] = { ...grid[y][x], height, width, src }
            this.setState({ grid })
        }
        img.src = src
    }

    mergeImages = async () => {
        // reduce the grid down to a simple array with accurate positions
        let curIdx = 0
        let rowHeight = 0
        const imgs = this.state.grid.reduce((acc, curRow, idx, src) => {
            let rowWidth = 0
            if (idx !== curIdx) {
                rowHeight = rowHeight + curRow[0].height
            }
            for (let i = 0; i < curRow.length; i++) {
                const { src, x, y } = curRow[i]
                if (i === 0) {
                    acc.push({
                        src,
                        x,
                        y: rowHeight
                    })
                } else {
                    rowWidth = rowWidth + curRow[i - 1].width
                    acc.push({
                        src,
                        x: rowWidth,
                        y: rowHeight
                    })
                }
            }


            return acc
        }, [])
        let finalHeight = 0
        let finalWidth = 0
        // calc final image width
        for (let i = 0; i < this.state.grid[0].length; i++) {
            const { width } = this.state.grid[0][i]
            finalWidth = finalWidth + width
        }
        // calc final image height
        for (let i = 0; i < this.state.grid.length; i++) {
            const { height } = this.state.grid[i][0]
            finalHeight = finalHeight + height
        }
        try {
            const b64 = await mergeImages(imgs, {
                height: finalHeight,
                width: finalWidth
            })
            this.setState({ img: b64 })
            await this.postMergedImage(b64)
            // load the open sea dragon embed
            // const osd = openseadragon({
            //     id: "openseadragon1",
            //     // prefixUrl: "http://localhost/",
            //     tileSources: "http://localhost:4000/dzis/test.dzi"
            // })
            // this.setState({ osd })
        } catch(err) {
            console.log(err)
        }
    }

    postMergedImage = async (b64) => {
        const resp = await fetch(`http://localhost:4000/merged-image`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                img: b64,
                name: 'test'
            })
        })
        if (resp.ok) {
            const json = await resp.json()
            console.log('dzi:', json.dzi)
        } else {
            console.log('something went wrong with your upload')
        }
    }

    makeGrid = (maxCols = 12, maxRows = 12) => {
        const grid = []
        let counter = 1

        for (let i = 0; i < maxRows; i++) {
            const row = []
            for (let j = 0; j < maxCols; j++) {
                row.push({
                    x: j,
                    y: i
                })
            }
            grid.push(row)
        }
        return grid
    }

    render() {
        return (
            <div className="App">
                <Grid grid={this.state.grid} updateFiles={this.updateFiles} />
                <button onClick={this.mergeImages}>Merge!</button>
                <div id="openseadragon1" style={{
                    height: 600,
                    width: 800
                }}></div>
                {this.state.img && <img alt="merged" src={this.state.img} />}
            </div>
        );
    }
}
