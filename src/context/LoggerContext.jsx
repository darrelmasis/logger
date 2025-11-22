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
