<#
.SYNOPSIS
    Vuelve a capturar la salida real de cada suite en salidas/*.txt.

.DESCRIPTION
    La presentación embebe estas salidas para que index.html funcione offline.
    Correr esto solo cuando cambien los tests; después, `python generar.py`.

    Saltea en silencio las suites cuya herramienta no esté instalada, así que
    si falta un SDK, esa salida simplemente queda como estaba.

.EXAMPLE
    .\capturar.ps1
    python generar.py
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

$aqui = $PSScriptRoot
$cruds = Split-Path -Parent $aqui
$destino = Join-Path $aqui 'salidas'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$rutasExtra = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "$env:USERPROFILE\.cargo\bin",
    "$env:ProgramFiles\Go\bin"
) | Where-Object { Test-Path $_ }

foreach ($ruta in $rutasExtra) {
    if ($env:Path -notlike "*$ruta*") { $env:Path = "$env:Path;$ruta" }
}

function Capturar {
    param([string]$Nombre, [string]$Carpeta, [string]$Requiere, [scriptblock]$Accion)

    if ($Requiere -and -not (Get-Command $Requiere -ErrorAction SilentlyContinue)) {
        Write-Host ("  {0,-8} salteado: falta '{1}'" -f $Nombre, $Requiere) -ForegroundColor DarkGray
        return
    }

    Push-Location $Carpeta
    $texto = (& $Accion 2>&1 | Out-String)
    Pop-Location

    $texto | Set-Content -Path (Join-Path $destino "$Nombre.txt") -Encoding UTF8
    Write-Host ("  {0,-8} {1} líneas" -f $Nombre, ($texto -split "`n").Count) -ForegroundColor Green
}

Write-Host ''
Write-Host '  Capturando salidas reales' -ForegroundColor Cyan
Write-Host '  -------------------------' -ForegroundColor Cyan

Capturar -Nombre 'csharp' -Carpeta "$cruds\csharp-dotnet" -Requiere 'dotnet' -Accion { dotnet test --nologo }
Capturar -Nombre 'python' -Carpeta "$cruds\python" -Requiere 'python' -Accion {
    if (Test-Path '.\venv\Scripts\python.exe') { .\venv\Scripts\python.exe -m pytest -v --no-header }
    else { python -m pytest -v --no-header }
}
Capturar -Nombre 'react' -Carpeta "$cruds\javascript-react" -Requiere 'node' -Accion { npm.cmd test -- --run --reporter=verbose }
Capturar -Nombre 'php' -Carpeta "$cruds\php" -Requiere 'php' -Accion { php vendor/bin/phpunit --testdox }
Capturar -Nombre 'rust' -Carpeta "$cruds\rust" -Requiere 'cargo' -Accion { cargo test }
Capturar -Nombre 'go' -Carpeta "$cruds\go" -Requiere 'go' -Accion { go test -v ./... }

# --- La fase RED ---
# Se reconstruye sobre una copia temporal del proyecto Go a la que se le saca
# la validación del título. El repositorio NO se toca.
if (Get-Command go -ErrorAction SilentlyContinue) {
    $copia = Join-Path $env:TEMP 'pgc-red'
    Remove-Item $copia -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "$cruds\go" $copia -Recurse

    $archivo = Join-Path $copia 'pelicula.go'
    $guarda = @'
	if titulo == "" {
		return Pelicula{}, fmt.Errorf("%w: el titulo no puede ser vacio", ErrDatosInvalidos)
	}

'@
    $contenido = Get-Content $archivo -Raw
    if ($contenido.Contains($guarda)) {
        Set-Content $archivo $contenido.Replace($guarda, '') -NoNewline

        Push-Location $copia
        $texto = (& go test -run 'TestDeberiaRechazarDatosInvalidos|TestDeberiaRetornarErrorAlCrearPeliculaConTituloVacio' -v ./... 2>&1 | Out-String)
        Pop-Location

        $texto | Set-Content -Path (Join-Path $destino 'go-red.txt') -Encoding UTF8
        Write-Host ("  {0,-8} {1} líneas (fase RED)" -f 'go-red', ($texto -split "`n").Count) -ForegroundColor Red
    } else {
        Write-Host '  go-red   salteado: cambió pelicula.go, revisá el fragmento a quitar' -ForegroundColor Yellow
    }

    Remove-Item $copia -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host '  Ahora: python generar.py' -ForegroundColor Cyan
Write-Host ''
