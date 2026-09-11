import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { usePlantas } from './usePlantas'

describe('usePlantas - crearPlanta', () => {
  it('deberia_crear_planta_con_id_autogenerado_y_dias_en_cero', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
    })

    expect(result.current.plantas).toHaveLength(1)
    expect(result.current.plantas[0].id).toBeGreaterThan(0)
    expect(result.current.plantas[0].diasDesdeUltimoRiego).toBe(0)
  })

  it('deberia_incrementar_id_al_crear_varias_plantas', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
      result.current.crearPlanta('Helecho', 'Helecho')
    })

    const [primera, segunda] = result.current.plantas
    expect(segunda.id).toBeGreaterThan(primera.id)
  })

  it('deberia_lanzar_error_al_crear_planta_con_nombre_vacio', () => {
    const { result } = renderHook(() => usePlantas())

    expect(() => {
      act(() => {
        result.current.crearPlanta('', 'Suculenta')
      })
    }).toThrow(Error)
  })
})

describe('usePlantas - obtenerPlantaPorId', () => {
  it('deberia_obtener_planta_por_id_existente', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
    })

    const planta = result.current.obtenerPlantaPorId(result.current.plantas[0].id)

    expect(planta.nombre).toBe('Cactus')
  })

  it('deberia_lanzar_error_al_obtener_planta_con_id_inexistente', () => {
    const { result } = renderHook(() => usePlantas())

    expect(() => result.current.obtenerPlantaPorId(999)).toThrow(Error)
  })
})

describe('usePlantas - obtenerTodas', () => {
  it('deberia_retornar_todas_las_plantas_registradas', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
      result.current.crearPlanta('Helecho', 'Helecho')
    })

    expect(result.current.plantas).toHaveLength(2)
  })
})

describe('usePlantas - actualizarPlanta', () => {
  it('deberia_actualizar_planta_existente', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
    })
    const id = result.current.plantas[0].id

    act(() => {
      result.current.actualizarPlanta(id, { nombre: 'Cactus Grande' })
    })

    expect(result.current.obtenerPlantaPorId(id).nombre).toBe('Cactus Grande')
  })

  it('deberia_lanzar_error_al_actualizar_planta_con_id_inexistente', () => {
    const { result } = renderHook(() => usePlantas())

    expect(() => {
      act(() => {
        result.current.actualizarPlanta(999, { nombre: 'Cactus Grande' })
      })
    }).toThrow(Error)
  })
})

describe('usePlantas - regarPlanta', () => {
  it('deberia_resetear_dias_desde_ultimo_riego_a_cero_al_regar_planta', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
    })
    const id = result.current.plantas[0].id

    act(() => {
      result.current.actualizarPlanta(id, { diasDesdeUltimoRiego: 5 })
    })
    act(() => {
      result.current.regarPlanta(id)
    })

    expect(result.current.obtenerPlantaPorId(id).diasDesdeUltimoRiego).toBe(0)
  })
})

describe('usePlantas - eliminarPlanta', () => {
  it('deberia_eliminar_planta_existente', () => {
    const { result } = renderHook(() => usePlantas())

    act(() => {
      result.current.crearPlanta('Cactus', 'Suculenta')
    })
    const id = result.current.plantas[0].id

    act(() => {
      result.current.eliminarPlanta(id)
    })

    expect(result.current.plantas).toHaveLength(0)
  })

  it('deberia_lanzar_error_al_eliminar_planta_con_id_inexistente', () => {
    const { result } = renderHook(() => usePlantas())

    expect(() => {
      act(() => {
        result.current.eliminarPlanta(999)
      })
    }).toThrow(Error)
  })
})
