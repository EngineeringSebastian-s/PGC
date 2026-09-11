import type { Planta } from '../domain/Planta'
import { TarjetaPlanta } from './TarjetaPlanta'

interface ListaPlantasProps {
  plantas: Planta[]
}

export function ListaPlantas({ plantas }: ListaPlantasProps) {
  if (plantas.length === 0) {
    return <p className="lista-plantas__vacia">Todavía no registraste ninguna planta.</p>
  }

  return (
    <div className="lista-plantas">
      {plantas.map((planta) => (
        <TarjetaPlanta key={planta.id} planta={planta} />
      ))}
    </div>
  )
}
