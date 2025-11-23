import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { loggerCore } from '../core/LoggerCore'
import { getIsProd } from '../utils/env'

const LoggerContext = createContext()

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  
  // Call getIsProd directly - it's a cheap runtime check
  // No need to memoize since environment won't change during app lifetime
  const isProd = getIsProd()

  // Se suscribe a los eventos del logger
  useEffect(() => {
    const unsubscribe = loggerCore.subscribe((logEntry) => {
      if (logEntry.type === 'clear') {
        setLogs([])
      } else {
        setLogs(prev => [...prev, logEntry])
      }
    })

    // Limpia la suscripción al desmontar el componente
    return unsubscribe
  }, [])

  // Captura errores JavaScript no manejados
  useEffect(() => {
    if (isProd) return

    const handleError = (event) => {
      // Evita el manejo de errores por defecto del navegador
      event.preventDefault()
      
      const errorMessage = event.error 
        ? event.error.stack || event.error.message 
        : event.message

      loggerCore.addLog('error',
        'Error No Capturado:',
        errorMessage,
        event.filename ? `en ${event.filename}:${event.lineno}:${event.colno}` : ''
      )
      
      return true
    }

    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [isProd])

  // Captura rechazos de promesas no manejados
  useEffect(() => {
    if (isProd) return

    const handleRejection = (event) => {
      event.preventDefault()
      
      const reason = event.reason?.stack || event.reason?.message || event.reason

      loggerCore.addLog('error',
        'Promesa No Manejada:',
        reason
      )
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [isProd])

  // Memoriza el valor del contexto para evitar renders innecesarios
  const contextValue = useMemo(() => ({ 
    logs,
    isProd 
  }), [logs, isProd])

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
    </LoggerContext.Provider>
  )
}

// Hook para acceder al contexto del logger desde componentes internos
export const useLoggerContext = () => useContext(LoggerContext)
