import { useLogger } from "./context/LoggerContext"

function App() {
  const { log } = useLogger()

  // log.error("Hello World")

  const obj = {
    1: "hola",
    2: "adios",
    3: {
      a: "hola",
      b: "adios"
    }
  }

  const handleAction = () => {
    // log('Mensaje simple')
    // log.info('Acción ejecutada correctamente')
    // log.warn('Advertencia: Esto podría causar problemas')
    // log.error('Error al procesar datos')
    log(window)
    log(window.navigator)
    log(window.document)
  }

  return (
    <div>
      <h1>Logger</h1>
      <button onClick={handleAction}>Ejecutar</button>
    </div>
  )
}

export default App
