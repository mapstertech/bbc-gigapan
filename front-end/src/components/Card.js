import React, { Component } from 'react'

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    
    render() {
        const { x, y, num } = this.props
        return (
            <div className="card">
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
