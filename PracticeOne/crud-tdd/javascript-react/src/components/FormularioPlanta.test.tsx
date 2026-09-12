import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'

import {FormularioPlanta} from './FormularioPlanta'

describe('FormularioPlanta', () => {
    it('deberia_llamar_a_onCrear_con_los_datos_ingresados_al_enviar_formulario', async () => {
        const onCrear = vi.fn()
        const usuario = userEvent.setup()
        render(<FormularioPlanta onCrear={onCrear}/>)

        await usuario.type(screen.getByLabelText('Nombre'), 'Cactus')
        await usuario.type(screen.getByLabelText('Tipo'), 'Suculenta')
        await usuario.click(screen.getByRole('button', {name: 'Crear'}))

        expect(onCrear).toHaveBeenCalledWith('Cactus', 'Suculenta')
    })

    it('deberia_mostrar_mensaje_de_error_si_se_envia_formulario_con_nombre_vacio', async () => {
        const onCrear = vi.fn()
        const usuario = userEvent.setup()
        render(<FormularioPlanta onCrear={onCrear}/>)

        await usuario.click(screen.getByRole('button', {name: 'Crear'}))

        expect(screen.getByText('El nombre no puede ser vacio')).toBeInTheDocument()
    })
})
