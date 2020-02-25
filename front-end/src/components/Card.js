import React, { Component } from 'react'

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const { x, y, num } = this.props
        return (
            <div className="card" style={{
                backgroundColor: '#D3D3D3',
                height: 100,
                width: 150,
                borderStyle: 'dashed',
                margin: 4,
            }}>
                <p>x: {x}, y: {y}, num: {num}</p>
                <input
                    type="file"
                    onChange={(e) => {
                        this.props.updateFiles({ num, x, y }, e.target.files)
                    }}
                    accept="type/image"
                />
            </div>
        )
    }
}
