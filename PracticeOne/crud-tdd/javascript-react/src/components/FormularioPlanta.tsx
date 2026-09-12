import {useState} from 'react'

interface FormularioPlantaProps {
    onCrear: (nombre: string, tipo: string) => void
}

export function FormularioPlanta({onCrear}: FormularioPlantaProps) {
    const [nombre, setNombre] = useState('')
    const [tipo, setTipo] = useState('')
    const [error, setError] = useState('')

    function manejarEnvio(evento: React.FormEvent) {
        evento.preventDefault()

        if (!nombre) {
            setError('El nombre no puede ser vacio')
            return
        }

        setError('')
        onCrear(nombre, tipo)
    }

    return (
        <form className="formulario-planta" onSubmit={manejarEnvio}>
            <div className="formulario-planta__campo">
                <label htmlFor="nombre">Nombre</label>
                <input
                    id="nombre"
                    placeholder="Ej: Cactus"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div className="formulario-planta__campo">
                <label htmlFor="tipo">Tipo</label>
                <input
                    id="tipo"
                    placeholder="Ej: Suculenta"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                />
            </div>

            <button type="submit">Crear</button>

            {error && <span className="formulario-planta__error">{error}</span>}
        </form>
    )
}
