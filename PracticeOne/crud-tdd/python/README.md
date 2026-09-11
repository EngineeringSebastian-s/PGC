# Colección de Vinilos — Python + pytest

CRUD en memoria para gestionar una colección de vinilos (álbum, artista, año, género), desarrollado con TDD.

## Qué incluye

- `src/vinilo.py`: entidad `Vinilo` con validaciones (campos obligatorios, año entre 1900 y el actual).
- `src/repositorio_vinilos.py`: CRUD en memoria (crear, obtener por id, listar, actualizar, eliminar).
- `src/main.py`: CLI interactiva para probar el CRUD a mano.
- `tests/`: 16 tests con pytest cubriendo entidad y repositorio.

## Cómo ejecutar

```powershell
python -m venv venv
venv\Scripts\activate       
pip install -r requirements.txt
```

## Cómo probar

Automatizado (16 tests):

```powershell
pytest -v
```

Manual, con menú interactivo por consola (crear, listar, obtener, actualizar, eliminar):

```powershell
python -m src.main
```

Cobertura (opcional, requiere `pytest-cov`):

```powershell
pytest --cov=src
```

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `test_deberia_crear_vinilo_con_datos_validos`
2. `test_deberia_lanzar_value_error_si_album_es_vacio`
3. `test_deberia_lanzar_value_error_si_artista_es_vacio`
4. `test_deberia_lanzar_value_error_si_anio_es_menor_a_1900`
5. `test_deberia_lanzar_value_error_si_anio_es_mayor_al_actual`
6. `test_deberia_crear_vinilo_y_asignarle_id_autoincremental`
7. `test_deberia_incrementar_id_al_crear_varios_vinilos`
8. `test_deberia_obtener_vinilo_por_id_existente`
9. `test_deberia_lanzar_vinilo_no_encontrado_error_al_buscar_id_inexistente`
10. `test_deberia_retornar_lista_vacia_si_no_hay_vinilos`
11. `test_deberia_retornar_todos_los_vinilos_registrados`
12. `test_deberia_actualizar_vinilo_existente_con_datos_parciales`
13. `test_deberia_lanzar_vinilo_no_encontrado_error_al_actualizar_id_inexistente`
14. `test_deberia_eliminar_vinilo_existente`
15. `test_deberia_lanzar_vinilo_no_encontrado_error_al_eliminar_id_inexistente`
16. `test_deberia_no_afectar_otros_vinilos_al_eliminar_uno`
