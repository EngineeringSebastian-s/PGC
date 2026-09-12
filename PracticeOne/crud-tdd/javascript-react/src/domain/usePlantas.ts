import {useRef, useState} from 'react'

import type {Planta} from './Planta'
import {validarPlanta} from './plantaUtils'

export function usePlantas() {
    const [plantas, setPlantas] = useState<Planta[]>([])
    const siguienteId = useRef(1)

    function crearPlanta(nombre: string, tipo: string): void {
        validarPlanta(nombre, 0)

        const nuevaPlanta: Planta = {id: siguienteId.current, nombre, tipo, diasDesdeUltimoRiego: 0}
        siguienteId.current += 1
        setPlantas((actuales) => [...actuales, nuevaPlanta])
    }

    function obtenerPlantaPorId(id: number): Planta {
        const planta = plantas.find((p) => p.id === id)
        if (!planta) {
            throw new Error(`No se encontro la planta con id ${id}`)
        }

        return planta
    }

    function actualizarPlanta(id: number, datos: Partial<Omit<Planta, 'id'>>): void {
        if (!plantas.some((p) => p.id === id)) {
            throw new Error(`No se encontro la planta con id ${id}`)
        }

        setPlantas((actuales) => actuales.map((p) => (p.id === id ? {...p, ...datos} : p)))
    }

    function eliminarPlanta(id: number): void {
        if (!plantas.some((p) => p.id === id)) {
            throw new Error(`No se encontro la planta con id ${id}`)
        }

        setPlantas((actuales) => actuales.filter((p) => p.id !== id))
    }

    function regarPlanta(id: number): void {
        actualizarPlanta(id, {diasDesdeUltimoRiego: 0})
    }

    return {plantas, crearPlanta, obtenerPlantaPorId, actualizarPlanta, eliminarPlanta, regarPlanta}
}
