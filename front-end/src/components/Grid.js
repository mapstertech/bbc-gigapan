import React from 'react'
import Card from './Card'

export default function Grid({ updateFiles, grid }) {
    // const grid = makeGrid(2, 2)
    return (
        <div className="grid">
            {grid.map((row, i) => {
                return <div key={i+'-row'} className="row">
                    {row.map(({ num, x, y }, j) => {
                        return <Card key={j+'-card'} updateFiles={updateFiles} num={num} x={x} y={y} />
                    })}
                </div>
            })}
        </div>
    )
}
