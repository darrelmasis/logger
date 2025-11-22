import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { detectEnv } from '../utils/env'

const LoggerContext = createContext()
export const useLogger = () => useContext(LoggerContext)

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  
  // Memoize isProd to prevent recalculation on every render
  const isProd = useMemo(() => detectEnv() === 'production', [])

  const addLog = useCallback((level, ...args) => {
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
  }, [isProd])

  // Memoize log function and its methods
  const log = useCallback((...args) => addLog('info', ...args), [addLog])
  
  log.success = useCallback((...args) => addLog('success', '[SUCCESS]', ...args), [addLog])
  log.info = useCallback((...args) => addLog('info', '[INFO]', ...args), [addLog])
  log.warn = useCallback((...args) => addLog('warn', '[WARN]', ...args), [addLog])
  log.error = useCallback((...args) => addLog('error', '[ERROR]', ...args), [addLog])
  log.force = useCallback((...args) => addLog('force', '[FORCE]', ...args), [addLog])
  log.env = useMemo(() => detectEnv(), [])

  const clearLogs = useCallback(() => {
    setLogs([])
    console.clear()
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    logs, 
    log, 
    clearLogs, 
    isProd 
  }), [logs, log, clearLogs, isProd])

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
    </LoggerContext.Provider>
  )
}
