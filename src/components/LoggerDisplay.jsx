import React, { useState, useEffect } from 'react'
import { useLogger } from '../context/LoggerContext'
import { JsonView } from './JsonView'

export const LoggerDisplay = () => {
  const { logs, clearLogs } = useLogger()
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  // Auto-expand when new logs arrive
  useEffect(() => {
    if (logs.length > 0 && !isExpanded) {
      setIsExpanded(true)
    }
  }, [logs.length])

  const hasLogs = logs.length > 0

  // Collapsed state (small circle)
  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: hasLogs ? 'rgba(76, 175, 80, 0.9)' : 'rgba(100, 100, 100, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 99999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontSize: 20,
          color: '#fff'
        }}
        title={hasLogs ? `${logs.length} log(s)` : 'Logger'}
      >
        {hasLogs ? logs.length : '📋'}
      </div>
    )
  }

  // Expanded state (full panel)
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 400,
      maxHeight: '50vh',
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: 12,
      borderRadius: 8,
      zIndex: 99999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <span style={{ fontWeight: 'bold' }}>Logger ({logs.length})</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Clear button */}
          <button
            onClick={() => clearLogs()}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,100,100,0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Clear all logs"
          >
            🗑️
          </button>
          {/* Minimize button */}
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Minimize"
          >
            −
          </button>
        </div>
      </div>

      {/* Logs content */}
      <div style={{
        overflowY: 'auto',
        padding: 10,
        flex: 1
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 20 }}>
            No logs yet...
          </div>
        ) : (
          logs.map((log, idx) => {
            const copyLog = () => {
              const textToCopy = log.message
              navigator.clipboard.writeText(textToCopy).then(() => {
                setCopiedIndex(idx)
                setTimeout(() => setCopiedIndex(null), 2000)
              })
            }

            return (
              <div key={idx} style={{
                color: log.level === 'success' ? '#4caf50' :
                       log.level === 'info' ? '#2196f3' :
                       log.level === 'warn' ? '#ff9800' :
                       log.level === 'error' ? '#f44336' :
                       log.level === 'force' ? '#9c27b0' : '#2196f3',
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: idx < logs.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                position: 'relative'
              }}>
                {/* Copy button */}
                <button
                  onClick={copyLog}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 4,
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                  title="Copy log"
                >
                  {copiedIndex === idx ? '✓' : '📋'}
                </button>

                <div style={{ 
                  fontFamily: 'monospace',
                  fontSize: 'inherit',
                  paddingRight: 40
                }}>
                  {log.data && log.data.length > 0 ? (
                    log.data.map((item, itemIdx) => (
                      <span key={itemIdx}>
                        {typeof item === 'object' && item !== null ? (
                          <JsonView data={item} />
                        ) : (
                          <span>{String(item)}</span>
                        )}
                        {itemIdx < log.data.length - 1 ? ' ' : ''}
                      </span>
                    ))
                  ) : (
                    <pre style={{ 
                      margin: 0, 
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {log.message}
                    </pre>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
