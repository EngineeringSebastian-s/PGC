import type {Planta} from '../domain/Planta'
import {necesitaAgua} from '../domain/plantaUtils'

interface TarjetaPlantaProps {
    planta: Planta
}

export function TarjetaPlanta({planta}: TarjetaPlantaProps) {
    return (
        <div className="tarjeta-planta" data-testid="tarjeta-planta">
            <div className="tarjeta-planta__info">
                <span className="tarjeta-planta__nombre">{planta.nombre}</span>
                <span className="tarjeta-planta__tipo">{planta.tipo}</span>
            </div>
            {necesitaAgua(planta) && (
                <span className="tarjeta-planta__alerta" data-testid="indicador-necesita-agua">
          💧 Necesita agua
        </span>
            )}
        </div>
    )
}
