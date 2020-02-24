import React, { Component } from 'react';
import mergeImages from 'merge-images'
import Grid from './components/Grid'

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            files: {
                // num: Number
            },
            img: null
        }
    }

    updateFiles = ({num, x, y}, files) => {
        const src = URL.createObjectURL(files[0])
        const img = new Image()
        img.onload = (e) => {
            const { height, width } = e.target
            this.setState({
                files: {
                    ...this.state.files,
                    [num]: {
                        src,
                        x, // x and y are where it'll be laid out in the merge
                        y,
                        height,
                        width,
                        // files,
                    }
                }
            })
        }
        img.src = src
    }

    mergeImages = async () => {
        const imgs = Object.keys(this.state.files).map((fileNum) => {            
            return this.state.files[fileNum]
        })
        // console.log('imgs', imgs)
        const b64 = await mergeImages(imgs)
        this.setState({ img: b64 })
    }

    render() {
        return (
            <div className="App">
                <Grid updateFiles={this.updateFiles} />
                <button onClick={this.mergeImages}>Merge!</button>
                {this.state.img && <img alt="merged" src={this.state.img} />}
            </div>
        );
    }
}
