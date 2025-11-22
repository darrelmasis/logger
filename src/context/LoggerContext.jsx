import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { loggerCore } from '../core/LoggerCore'
import { detectEnv } from '../utils/env'

const LoggerContext = createContext()

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  
  // Memoize isProd to prevent recalculation on every render
  const isProd = useMemo(() => detectEnv() === 'production', [])

  // Subscribe to logger events
  useEffect(() => {
    const unsubscribe = loggerCore.subscribe((logEntry) => {
      if (logEntry.type === 'clear') {
        setLogs([])
      } else {
        setLogs(prev => [...prev, logEntry])
      }
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  // Capture uncaught JavaScript errors
  useEffect(() => {
    if (isProd) return

    const handleError = (event) => {
      // Prevent default browser error handling
      event.preventDefault()
      
      const errorMessage = event.error 
        ? event.error.stack || event.error.message 
        : event.message

      loggerCore.addLog('error', [
        'Uncaught Error:',
        errorMessage,
        event.filename ? `at ${event.filename}:${event.lineno}:${event.colno}` : ''
      ])
      
      return true
    }

    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [isProd])

  // Capture unhandled promise rejections
  useEffect(() => {
    if (isProd) return

    const handleRejection = (event) => {
      event.preventDefault()
      
      const reason = event.reason?.stack || event.reason?.message || event.reason

      loggerCore.addLog('error', [
        'Unhandled Promise Rejection:',
        reason
      ])
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [isProd])

  // Memoize context value to prevent unnecessary re-renders
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

// Export hook for internal use by LoggerDisplay
export const useLoggerContext = () => useContext(LoggerContext)
