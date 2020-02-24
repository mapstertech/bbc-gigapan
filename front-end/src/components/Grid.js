import React from 'react'
import Square from './Square'
import Card from './Card'

export default function Grid({ updateFiles }) {
    const grid = makeGrid(2, 2)
    return (
        <div className="grid">
            {grid.map((row, i) => {
                return <div key={i+'-row'} className="row">
                    {row.map(({ num, x, y }, j) => {
                        return (
                            <Square key={j+'-square'}>
                                <Card updateFiles={updateFiles} num={num} x={x} y={y} />
                            </Square>        
                        )
                    })}
                </div>
            })}
        </div>
    )
}

function makeGrid(maxCols = 12, maxRows = 12) {
    const grid = []
    let counter = 1

    for (let i = 0; i < maxRows; i++) {
        const row = []
        for (let j = 0; j < maxCols; j++) {
            row.push({
                num: counter++,
                x: j,
                y: i
            })
        }
        grid.push(row)
    }
    return grid
}
