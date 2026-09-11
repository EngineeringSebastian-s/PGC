# Plantas de Jardín — React + TypeScript + Vitest

CRUD en memoria para gestionar plantas de un jardín (nombre, tipo, días desde el último riego), desarrollado con TDD.

## Qué incluye

- `src/domain/Planta.ts` y `plantaUtils.ts`: tipo `Planta` y validaciones (nombre no vacío, días no negativos, cálculo de necesidad de riego).
- `src/domain/usePlantas.ts`: hook con el CRUD en memoria (crear, obtener, actualizar, regar, eliminar).
- `src/components/`: `FormularioPlanta`, `ListaPlantas` y `TarjetaPlanta` para la UI.
- `src/**/*.test.{ts,tsx}`: 21 tests con Vitest + Testing Library.

## Cómo ejecutar

```powershell
npm install
npm run dev
```

> **Nota (Windows/PowerShell):** si `npm` falla con `no está firmado digitalmente` /
> `UnauthorizedAccess` (PSSecurityException), es la política de ejecución de scripts
> de PowerShell bloqueando `npm.ps1`. Usa `npm.cmd <comando>` o `cmd /c "npm <comando>"`
> como alternativa, o corré `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` una
> sola vez para solucionarlo de forma permanente.

## Cómo probar

Automatizado (21 tests):

```powershell
npm test
```

o directamente:

```powershell
npx vitest
```

Manual, con la app corriendo (`npm run dev`): completá el formulario para crear una
planta y verificá que aparezca en la lista, con el indicador de riego cuando corresponda.

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `deberia_retornar_true_en_necesitaAgua_cuando_dias_es_igual_a_3`
2. `deberia_retornar_true_en_necesitaAgua_cuando_dias_es_mayor_a_3`
3. `deberia_retornar_false_en_necesitaAgua_cuando_dias_es_menor_a_3`
4. `deberia_lanzar_error_en_validarPlanta_si_nombre_es_vacio`
5. `deberia_lanzar_error_en_validarPlanta_si_dias_es_negativo`
6. `no_deberia_lanzar_error_en_validarPlanta_con_datos_validos`
7. `deberia_crear_planta_con_id_autogenerado_y_dias_en_cero`
8. `deberia_incrementar_id_al_crear_varias_plantas`
9. `deberia_lanzar_error_al_crear_planta_con_nombre_vacio`
10. `deberia_obtener_planta_por_id_existente`
11. `deberia_lanzar_error_al_obtener_planta_con_id_inexistente`
12. `deberia_retornar_todas_las_plantas_registradas`
13. `deberia_actualizar_planta_existente`
14. `deberia_lanzar_error_al_actualizar_planta_con_id_inexistente`
15. `deberia_resetear_dias_desde_ultimo_riego_a_cero_al_regar_planta`
16. `deberia_eliminar_planta_existente`
17. `deberia_lanzar_error_al_eliminar_planta_con_id_inexistente`
18. `deberia_renderizar_una_tarjeta_por_cada_planta`
19. `deberia_mostrar_indicador_visual_cuando_planta_necesita_agua`
20. `deberia_llamar_a_onCrear_con_los_datos_ingresados_al_enviar_formulario`
21. `deberia_mostrar_mensaje_de_error_si_se_envia_formulario_con_nombre_vacio`

## Detalle técnico

`usePlantas` guarda el id autoincremental en un `useRef` en vez de `useState` para
evitar colisiones al crear varias plantas dentro del mismo batch de actualizaciones de React.
