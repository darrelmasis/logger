import { createContext, useContext, useState } from 'react'
import { isProd, detectEnv } from '../utils/env'

const LoggerContext = createContext()
export const useLogger = () => useContext(LoggerContext)

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([])

  const addLog = (level, ...args) => {
    if (!isProd || level === 'force') {
      // Mapear niveles personalizados a métodos válidos de console
      const consoleMethod = level === 'success' || level === 'info' ? 'log' :
                           level === 'force' ? 'log' :
                           level === 'warn' ? 'warn' :
                           level === 'error' ? 'error' : 'log'
      
      // Pasar argumentos directamente a console para preservar la inspección de objetos
      console[consoleMethod](...args)
      
      // Para mostrar, convertir objetos a un formato legible
      const message = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            // Manejar referencias circulares
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
      
      // Guardar tanto los datos originales como el mensaje formateado con timestamp
      const timestamp = new Date()
      setLogs(prev => [...prev, { level, message, data: args, timestamp }])
    }
  }

  const log = (...args) => addLog('info', ...args)
  
  log.success = (...args) => addLog('success', '[SUCCESS]', ...args)
  log.info = (...args) => addLog('info', '[INFO]', ...args)
  log.warn = (...args) => addLog('warn', '[WARN]', ...args)
  log.error = (...args) => addLog('error', '[ERROR]', ...args)
  log.force = (...args) => addLog('force', '[FORCE]', ...args)
  log.env = detectEnv()

  const clearLogs = () => {
    setLogs([])
    console.clear()
  }

  return (
    <LoggerContext.Provider value={{ logs, log, clearLogs, isProd }}>
      {children}
    </LoggerContext.Provider>
  )
}
