import type { Planta } from './Planta'

export function necesitaAgua(planta: Planta): boolean {
  return planta.diasDesdeUltimoRiego >= 3
}

export function validarPlanta(nombre: string, diasDesdeUltimoRiego: number): void {
  if (!nombre) {
    throw new Error('El nombre no puede ser vacio')
  }

  if (diasDesdeUltimoRiego < 0) {
    throw new Error('Los dias desde el ultimo riego no pueden ser negativos')
  }
}
