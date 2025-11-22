import { useLogger } from "./context/LoggerContext"

function App() {
  const { log, isProd } = useLogger()

  const handleAction = () => {
    log("Retorno del server", { name: 'Darel Masis', age: 25 })
    log.force(isProd)
  }

  return (
    <div>
      <h1>Logger</h1>
      <button onClick={handleAction}>Ejecutar</button>
    </div>
  )
}

export default App
