import React, {
    Component
} from 'react';
import openseadragon from 'openseadragon'
import mergeImages from 'merge-images'
import Grid from './components/Grid'

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            img: null,
            grid: this.makeGrid(2, 2),
            osd: null,
            dziAddress: "",
        }
        this.fileInput = React.createRef()
    }

    updateFiles = ({ x, y }, files) => {
        const src = URL.createObjectURL(files[0])
        const img = new Image()
        img.onload = (e) => {
            const {
                height,
                width
            } = e.target
            const grid = [...this.state.grid]
            grid[y][x] = {
                ...grid[y][x],
                height,
                width,
                src
            }
            this.setState({
                grid
            })
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
                const {
                    src,
                    x,
                    y
                } = curRow[i]
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
            const {
                width
            } = this.state.grid[0][i]
            finalWidth = finalWidth + width
        }
        // calc final image height
        for (let i = 0; i < this.state.grid.length; i++) {
            const {
                height
            } = this.state.grid[i][0]
            finalHeight = finalHeight + height
        }
        try {
            const b64 = await mergeImages(imgs, {
                height: finalHeight,
                width: finalWidth
            })
            this.setState({
                img: b64
            })
            await this.postMergedImage(b64)
            // load the open sea dragon embed
        } catch (err) {
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

    handleSubmit = async (e) => {
        e.preventDefault()
        const file = this.fileInput.current.files && this.fileInput.current.files[0]
        if (!file) {
            alert('you must upload a file')
        } else {
            const formData = new FormData()
            formData.append('gp', file)
            const resp = await await fetch('http://localhost:4000/fileUploadGP', {
                method: 'POST',
                body: formData
            })
            const { dzi } = await resp.json()
            openseadragon({
                id: "openseadragon1",
                tileSources: dzi
            })
            this.setState({ dziAddress: dzi })
        }
    }

    componentDidMount() {
        const osd = openseadragon({
            id: "openseadragon1",
            tileSources: "http://localhost:4000/dzis/ptgui-panorama.jpg.dzi"
        })
        // this.setState({
        //     osd
        // })
    }

    render() {
        return (
            <div className="App">
                < br/>
                <div style={{ width: 800, margin: 'auto' }}>
                    <h3 >gigapan viewer</h3>
                    <p >Current dzi adddress: <a href={this.state.dziAddress}>{this.state.dziAddress}</a></p>
                    <div>
                        <h4>Upload new gigapan</h4>
                        {/* <form action="fileUploadGP" method="post" enctype="multipart/form-data"> */}
                        <form onSubmit={this.handleSubmit}>
                            {/* <input value={this.state.files} onChange={(e) => this.setState({ files: e.target.files })} type="file" name="gp"/> */}
                            <input type="file" name="gp" ref={this.fileInput} />
                            <br/>
                            <input type="submit" />
                        </form>
                    </div>
                </div>
                < br/>
                < br/>
                <div id="openseadragon1" style={{
                    height: 600,
                    width: 800,
                    margin: 'auto',
                }}></div>
                {this.state.img && <img alt="merged" src={this.state.img} />}
            </div>
        );
    }
}
