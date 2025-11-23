/**
 * Detects the current environment at RUNTIME.
 * 
 * IMPORTANT: For libraries, we can't rely on import.meta.env because those values
 * are replaced at library build-time, not consumer build-time. This means any
 * import.meta.env.* check will always return the value from when the library was built.
 * 
 * Instead, we use browser-based runtime detection using window.location.hostname.
 * 
 * @returns {'development' | 'production'} Current environment
 */
export const detectEnv = () => {
  // Runtime browser-based detection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    
    // Development indicators - localhost and local IPs
    if (host === 'localhost' || 
        host === '127.0.0.1' || 
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.endsWith('.local')) {
      return 'development'
    }
    
    // Check for common development/preview/staging indicators in hostname
    if (host.includes('localhost') || 
        host.includes('dev.') || 
        host.includes('-dev.') ||
        host.includes('.dev-') ||
        host.includes('preview') ||
        host.includes('staging') ||
        host.includes('-test.') ||
        host.includes('.test')) {
      return 'development'
    }
    
    // Everything else is production
    return 'production'
  }
  
  // SSR or non-browser environment - default to development to be safe
  // (better to show logs than hide them in development)
  return 'development'
}

/**
 * Helper function to check if current environment is production.
 * Call this at runtime, not at module initialization.
 * 
 * @returns {boolean} True if in production environment
 */
export const getIsProd = () => detectEnv() === 'production'
