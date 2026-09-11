import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Planta } from '../domain/Planta'
import { ListaPlantas } from './ListaPlantas'

const plantas: Planta[] = [
  { id: 1, nombre: 'Cactus', tipo: 'Suculenta', diasDesdeUltimoRiego: 1 },
  { id: 2, nombre: 'Helecho', tipo: 'Helecho', diasDesdeUltimoRiego: 4 },
]

describe('ListaPlantas', () => {
  it('deberia_renderizar_una_tarjeta_por_cada_planta', () => {
    render(<ListaPlantas plantas={plantas} />)

    expect(screen.getAllByTestId('tarjeta-planta')).toHaveLength(2)
  })

  it('deberia_mostrar_indicador_visual_cuando_planta_necesita_agua', () => {
    render(<ListaPlantas plantas={plantas} />)

    expect(screen.getAllByTestId('indicador-necesita-agua')).toHaveLength(1)
  })
})
