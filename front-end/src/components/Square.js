import React from 'react'

export default function Square({ children }) {
    return (
        <div className="square" style={{
            backgroundColor: '#D3D3D3',
            height: 100,
            width: 150,
            borderStyle: 'dashed',
            margin: 4,
        }}>
            {children}
        </div>
    )
}
