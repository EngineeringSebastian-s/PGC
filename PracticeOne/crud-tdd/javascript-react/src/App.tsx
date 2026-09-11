import { FormularioPlanta } from './components/FormularioPlanta'
import { ListaPlantas } from './components/ListaPlantas'
import { usePlantas } from './domain/usePlantas'
import './App.css'

function App() {
  const { plantas, crearPlanta } = usePlantas()

  return (
    <section className="app">
      <header className="app__header">
        <h1>🌿 Plantas de jardín</h1>
        <p className="app__subtitle">Registrá tus plantas y llevá el control del riego</p>
      </header>
      <FormularioPlanta onCrear={crearPlanta} />
      <ListaPlantas plantas={plantas} />
    </section>
  )
}

export default App

