import { describe, expect, it } from 'vitest'

import type { Planta } from './Planta'
import { necesitaAgua, validarPlanta } from './plantaUtils'

function crearPlanta(diasDesdeUltimoRiego: number): Planta {
  return { id: 1, nombre: 'Cactus', tipo: 'Suculenta', diasDesdeUltimoRiego }
}

describe('necesitaAgua', () => {
  it('deberia_retornar_true_en_necesitaAgua_cuando_dias_es_igual_a_3', () => {
    const planta = crearPlanta(3)

    const resultado = necesitaAgua(planta)

    expect(resultado).toBe(true)
  })

  it('deberia_retornar_true_en_necesitaAgua_cuando_dias_es_mayor_a_3', () => {
    const planta = crearPlanta(5)

    const resultado = necesitaAgua(planta)

    expect(resultado).toBe(true)
  })

  it('deberia_retornar_false_en_necesitaAgua_cuando_dias_es_menor_a_3', () => {
    const planta = crearPlanta(1)

    const resultado = necesitaAgua(planta)

    expect(resultado).toBe(false)
  })
})

describe('validarPlanta', () => {
  it('deberia_lanzar_error_en_validarPlanta_si_nombre_es_vacio', () => {
    expect(() => validarPlanta('', 0)).toThrow(Error)
  })

  it('deberia_lanzar_error_en_validarPlanta_si_dias_es_negativo', () => {
    expect(() => validarPlanta('Cactus', -1)).toThrow(Error)
  })

  it('no_deberia_lanzar_error_en_validarPlanta_con_datos_validos', () => {
    expect(() => validarPlanta('Cactus', 0)).not.toThrow()
  })
})
