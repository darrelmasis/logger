import React, { useState } from 'react'

export const JsonView = ({ data, level = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(level > 0)

  if (data === null) return <span style={{ color: '#999' }}>null</span>
  if (data === undefined) return <span style={{ color: '#999' }}>undefined</span>
  
  const type = typeof data
  
  // Primitive types
  if (type === 'string') {
    return <span style={{ color: '#ce9178' }}>"{data}"</span>
  }
  if (type === 'number') {
    return <span style={{ color: '#b5cea8' }}>{data}</span>
  }
  if (type === 'boolean') {
    return <span style={{ color: '#569cd6' }}>{String(data)}</span>
  }

  // Arrays
  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>
    
    return (
      <span>
        <span 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {isCollapsed ? '▶' : '▼'}
        </span>
        {' '}
        {isCollapsed ? (
          <span style={{ color: '#888' }}>[{data.length} items]</span>
        ) : (
          <>
            [
            <div style={{ paddingLeft: 20 }}>
              {data.map((item, idx) => (
                <div key={idx}>
                  <JsonView data={item} level={level + 1} />
                  {idx < data.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
            ]
          </>
        )}
      </span>
    )
  }

  // Objects
  if (type === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return <span>{'{}'}</span>

    return (
      <span>
        <span 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {isCollapsed ? '▶' : '▼'}
        </span>
        {' '}
        {isCollapsed ? (
          <span style={{ color: '#888' }}>{'{'}{entries.length} keys{'}'}</span>
        ) : (
          <>
            {'{'}
            <div style={{ paddingLeft: 20 }}>
              {entries.map(([key, value], idx) => (
                <div key={key}>
                  <span style={{ color: '#9cdcfe' }}>"{key}"</span>: <JsonView data={value} level={level + 1} />
                  {idx < entries.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
            {'}'}
          </>
        )}
      </span>
    )
  }

  return <span>{String(data)}</span>
}
