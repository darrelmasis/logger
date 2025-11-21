import React, { createContext, useContext, useState } from 'react'
import { isProd, detectEnv } from '../utils/env'

const LoggerContext = createContext()
export const useLogger = () => useContext(LoggerContext)

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([])

  const addLog = (level, ...args) => {
    if (!isProd || level === 'force') {
      const consoleMethod = level === 'force' || level === 'log' ? 'log' : level
      // Pass arguments directly to console to preserve object inspection
      console[consoleMethod](...args)
      
      // For display, convert objects to a readable format
      const message = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            // Handle circular references
            const seen = new WeakSet()
            return JSON.stringify(arg, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]'
                }
                seen.add(value)
              }
              return value
            }, 2)
          } catch (e) {
            return `[Object: ${Object.prototype.toString.call(arg)}]`
          }
        }
        return String(arg)
      }).join(' ')
      
      // Store both the original data and formatted message
      setLogs(prev => [...prev, { level, message, data: args }])
    }
  }

  const log = (...args) => addLog('info', ...args)
  
  log.success = (...args) => addLog('success', '[SUCCESS]', ...args)
  log.info = (...args) => addLog('info', '[INFO]', ...args)
  log.warn = (...args) => addLog('warn', '[WARN]', ...args)
  log.error = (...args) => addLog('error', '[ERROR]', ...args)
  log.force = (...args) => addLog('force', '[FORCE]', ...args)
  log.env = detectEnv()

  const clearLogs = () => setLogs([])

  return (
    <LoggerContext.Provider value={{ logs, log, clearLogs }}>
      {children}
    </LoggerContext.Provider>
  )
}
