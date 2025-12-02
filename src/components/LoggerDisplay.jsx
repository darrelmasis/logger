import { useState, useEffect, useRef } from 'react'
import { useLoggerContext } from '../context/LoggerContext'
import { log } from '../core/LoggerCore'
import { JsonView } from './JsonView'
import { formatTime } from '../utils/utils'
import '../styles/logger.scss'
import Icon from './Icons'
import LogoLight from '../assets/dev-logger-dark.svg'
import LogoDark from '../assets/dev-logger.svg'

// Función auxiliar para crear una clave única para agrupar logs
const getLogKey = (log) => {
  let dataString
  
  if (log.data && log.data.length > 0) {
    try {
      // Intenta convertir los datos a string
      dataString = JSON.stringify(log.data)
    } catch (error) {
      // Si hay referencia circular u otro error, usa el mensaje procesado como respaldo
      // log.message ya maneja referencias circulares gracias a LoggerCore
      dataString = log.message
    }
  } else {
    dataString = log.message
  }
  
  return `${log.level || 'info'}:${dataString}`
}

// Función para agrupar logs idénticos
const groupLogs = (logs) => {
  const groups = []
  const groupMap = new Map()

  logs.forEach((log) => {
    const key = getLogKey(log)
    
    if (groupMap.has(key)) {
      // Agregar al grupo existente
      const groupIndex = groupMap.get(key)
      groups[groupIndex].logs.push(log)
      groups[groupIndex].count++
    } else {
      // Crear nuevo grupo
      const newGroup = {
        key,
        logs: [log],
        count: 1,
        level: log.level,
        message: log.message,
        data: log.data,
        timestamp: log.timestamp // Mantiene la primera marca de tiempo para mostrar
      }
      groupMap.set(key, groups.length)
      groups.push(newGroup)
    }
  })

  return groups
}

const LogItem = ({ logGroup, isDarkMode, isLast, isExpanded, onToggle }) => {
  const [copied, setCopied] = useState(false)
  const log = logGroup.logs[0] // Usa el primer log para mostrar

  const copyLog = (e) => {
    e.stopPropagation()
    const textToCopy = log.message
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const themeClass = isDarkMode ? 'logger-dark' : 'logger-light'
  const levelClass = `logger-${log.level || 'info'}`
  const lastClass = isLast ? 'logger-item-last' : ''
  const expandedClass = isExpanded ? 'logger-item-expanded' : ''

  return (
    <div 
      onClick={onToggle}
      className={`logger-item ${levelClass} ${themeClass} ${lastClass} ${expandedClass}`}
    >
      

      <div className={`logger-timestamp ${themeClass}`}>
        [{formatTime(log.timestamp)}]
        {logGroup.count > 1 && (
          <span className="logger-group-count">
            ×{logGroup.count}
          </span>
        )}
      </div>

      <div className="logger-log-content">
        {log.data && log.data.length > 0 ? (
          <div className="logger-data-container">
            {log.data.map((item, itemIdx) => {
              const isObject = typeof item === 'object' && item !== null
              return (
                <span key={itemIdx} className={isObject ? 'logger-data-item-block' : 'logger-data-item-inline'}>
                  {isObject ? (
                    <JsonView 
                      data={item} 
                      isDarkMode={isDarkMode} 
                      collapsed={!isExpanded}
                      onToggle={onToggle}
                    />
                  ) : (
                    <span>{String(item)}</span>
                  )}
                  {!isObject && itemIdx < log.data.length - 1 && ' '}
                </span>
              )
            })}
          </div>
        ) : (
          <pre>{log.message}</pre>
        )}
      </div>

      <button
        onClick={copyLog}
        className={`logger-copy-btn ${themeClass}`}
      >
        {copied ?
          <Icon name="check" size="sm" /> :
          <Icon name="copy" size="sm" />}
      </button>
    </div>
  )
}

export const LoggerDisplay = () => {
  const { logs, isProd } = useLoggerContext()
  const [isExpanded, setIsExpanded] = useState(() => {
    if (isProd) return false
    const savedExpanded = localStorage.getItem('logger-expanded')
    return savedExpanded ? savedExpanded === 'true' : false
  })
  const [isPinned, setIsPinned] = useState(() => {
    if (isProd) return false
    const savedPinned = localStorage.getItem('logger-pinned')
    return savedPinned ? savedPinned === 'true' : false
  })
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (isProd) return true
    const savedTheme = localStorage.getItem('logger-theme')
    return savedTheme ? savedTheme === 'dark' : true
  })
  const [expandedLogIndex, setExpandedLogIndex] = useState(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const panelRef = useRef(null)
  const contentRef = useRef(null)

  // Agrupa logs para mostrar
  const groupedLogs = groupLogs(logs)

  // Función para copiar todos los logs
  const copyAllLogs = (e) => {
    e.stopPropagation()
    const allLogsText = logs.map((log) => {
      const timestamp = formatTime(log.timestamp)
      return `[${timestamp}] ${log.message}`
    }).join('\n')
    
    navigator.clipboard.writeText(allLogsText).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  useEffect(() => {
    if (isProd) return
    localStorage.setItem('logger-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, isProd])

  useEffect(() => {
    if (isProd) return
    localStorage.setItem('logger-pinned', isPinned.toString())
  }, [isPinned, isProd])

  useEffect(() => {
    if (isProd) return
    localStorage.setItem('logger-expanded', isExpanded.toString())
  }, [isExpanded, isProd])

  useEffect(() => {
    if (isProd) return
    if (logs.length > 0 && !isExpanded) {
      // Opcional: lógica de auto-expansión
    }
  }, [logs.length, isExpanded, isProd])

  // Auto-scroll al final cuando llegan nuevos logs
  useEffect(() => {
    if (isProd) return
    if (contentRef.current && isExpanded) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [logs, isExpanded, isProd])

  // Clic fuera para minimizar (solo si no está fijado)
  useEffect(() => {
    if (isProd) return
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isExpanded && !isPinned) {
        setIsExpanded(false)
      }
    }

    if (isExpanded && !isPinned) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, isPinned, isProd])

  // No renderizar en producción - retorna null después de todos los hooks
  if (isProd) {
    return null
  }

  const hasLogs = logs.length > 0
  const themeClass = isDarkMode ? 'logger-dark' : 'logger-light'

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className={`logger-collapsed ${themeClass}`}
        title={hasLogs ? `${groupedLogs.length} grupo(s) de logs` : 'Logger'}
      >
        <Icon name="code-simple" size="md" />
        {hasLogs && (
          <span className={`logger-badge ${themeClass}`}>
            {groupedLogs.length > 99 ? '99+' : groupedLogs.length}
          </span>
        )}
      </div>
    )
  }

  return (
    <div ref={panelRef} className={`logger-panel ${themeClass}`}>
      <div 
        className={`logger-header ${themeClass}`}
        onClick={() => setIsExpanded(false)}
        style={{ cursor: 'pointer' }}
      >
        <span className="logger-title">
          <img 
            src={isDarkMode ? LogoDark : LogoLight} 
            alt="Dev Logger" 
            className="logger-logo" 
          />
          <span>({groupedLogs.length})</span>
        </span>
        <div className="logger-buttons">
          {/* Grupo 1: Acciones sobre contenido */}
          <button
            onClick={copyAllLogs}
            disabled={logs.length === 0}
            className={`logger-btn ${themeClass} ${logs.length === 0 ? 'logger-btn-disabled' : ''}`}
            title={logs.length === 0 ? 'No hay logs para copiar' : 'Copiar todos los logs'}
          >
            {copiedAll ? <Icon name="check" size="sm" /> : <Icon name="copy" size="sm" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              log.clear()
            }}
            disabled={logs.length === 0}
            className={`logger-btn logger-btn-clear ${themeClass} ${logs.length === 0 ? 'logger-btn-disabled' : ''}`}
            title={logs.length === 0 ? 'No hay logs para limpiar' : 'Limpiar todos los logs'}
          >
            <Icon name="broom-wide" size="sm" />
          </button>

          {/* Separador */}
          <div className={`logger-btn-separator ${themeClass}`}></div>

          {/* Grupo 2: Configuración de vista */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsDarkMode(!isDarkMode)
            }}
            className={`logger-btn ${themeClass}`}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? <Icon name="sun-bright" size="sm" /> : <Icon name="moon-stars" size="sm" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsPinned(!isPinned)
            }}
            className={`logger-btn ${themeClass}`}
            title={isPinned ? 'Desfijar panel' : 'Fijar panel'}
          >
            {isPinned ? <Icon name="lock" size="sm" /> : <Icon name="lock-open" size="sm" />}
          </button>

          {/* Separador */}
          <div className={`logger-btn-separator ${themeClass}`}></div>

          {/* Grupo 3: Control de ventana */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
            className={`logger-btn logger-btn-minimize ${themeClass}`}
            title="Minimizar"
          >
            <Icon name="window-minimize" size="sm" />
          </button>
        </div>
      </div>

      <div ref={contentRef} className={`logger-content ${themeClass}`}>
        {logs.length === 0 ? (
          <div className={`logger-empty ${themeClass}`}>
            <div className="empty-screen">
              <Icon name="empty-set" size="2xl" style="light" family="classics" />
            </div>
          </div>
        ) : (
          groupedLogs.map((logGroup, idx) => (
            <LogItem 
              key={logGroup.key} 
              logGroup={logGroup} 
              isDarkMode={isDarkMode} 
              isLast={idx === groupedLogs.length - 1}
              isExpanded={expandedLogIndex === idx}
              onToggle={() => setExpandedLogIndex(expandedLogIndex === idx ? null : idx)}
            />
          ))
        )}
      </div>
    </div>
  )
}
