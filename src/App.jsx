import { useState } from 'react'
import { log } from './core/LoggerCore'
import './App.css'

// ✅ Test: log en el cuerpo del componente (NO debe causar re-renders infinitos)
log.info('App component rendering')

function App() {
  const [count, setCount] = useState(0)

  // ✅ Test: log en el cuerpo del componente
  log.warn(`App rendered with count: ${count}`)

  const handleClick = () => {
    setCount(c => c + 1)
    log.success(`Button clicked! New count: ${count + 1}`)
  }

  const testAllLevels = () => {
    log('Default log message')
    log.info('Info message')
    log.success('Success message')
    log.warn('Warning message')
    log.error('Error message')
    log.force('Force message (shows in production)')
    
    // Test objects
    log({ user: { name: 'Test', age: 30 } })
    
    // Test arrays
    log([1, 2, 3, 4, 5])
    
    // Test circular references
    const circular = { a: 1 }
    circular.self = circular
    log(circular)
  }

  const clearAllLogs = () => {
    log.clear()
  }

  return (
    <div className="App">
      <h1>@dmasis/logger Test</h1>
      
      <div className="card">
        <button onClick={handleClick}>
          Count is {count}
        </button>
        
        <button onClick={testAllLevels} style={{ marginLeft: '10px' }}>
          Test All Log Levels
        </button>
        
        <button onClick={clearAllLogs} style={{ marginLeft: '10px' }}>
          Clear Logs
        </button>
      </div>

      <div className="info">
        <p>✅ Check console and logger panel</p>
        <p>✅ No infinite re-renders</p>
        <p>Environment: <strong>{log.env}</strong></p>
      </div>
    </div>
  )
}

export default App
