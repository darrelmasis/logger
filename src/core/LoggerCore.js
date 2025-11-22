import { detectEnv } from '../utils/env'

class LoggerCore {
  constructor() {
    this.listeners = []
    this.isProd = detectEnv() === 'production'
  }

  subscribe(callback) {
    this.listeners.push(callback)
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  emit(logEntry) {
    this.listeners.forEach(listener => listener(logEntry))
  }

  addLog(level, ...args) {
    if (!this.isProd || level === 'force') {
      // Map custom levels to valid console methods
      const consoleMethod = level === 'success' || level === 'info' ? 'log' :
                           level === 'force' ? 'log' :
                           level === 'warn' ? 'warn' :
                           level === 'error' ? 'error' : 'log'
      
      // Pass arguments directly to console to preserve object inspection
      console[consoleMethod](...args)
      
      // For display, convert objects to readable format
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
      
      // Create log entry with timestamp
      const logEntry = {
        level,
        message,
        data: args,
        timestamp: new Date()
      }
      
      // Emit event to all listeners
      this.emit(logEntry)
    }
  }

  clear() {
    console.clear()
    this.emit({ type: 'clear' })
  }
}

// Create singleton instance
const loggerCore = new LoggerCore()

// Create log function with methods
const log = (...args) => loggerCore.addLog('info', ...args)

log.success = (...args) => loggerCore.addLog('success', '[SUCCESS]', ...args)
log.info = (...args) => loggerCore.addLog('info', '[INFO]', ...args)
log.warn = (...args) => loggerCore.addLog('warn', '[WARN]', ...args)
log.error = (...args) => loggerCore.addLog('error', '[ERROR]', ...args)
log.force = (...args) => loggerCore.addLog('force', '[FORCE]', ...args)
log.env = detectEnv()
log.clear = () => loggerCore.clear()

// Export both the log function and the core instance for internal use
export { log, loggerCore }
