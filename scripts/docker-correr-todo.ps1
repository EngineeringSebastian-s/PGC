<#
.SYNOPSIS
    Corre todas las suítes del repo dentro de contenedores Docker.

.DESCRIPTION
    No necesita ningún SDK instalado en la máquina: solo Docker.
    Cada suite corre en la imagen oficial de su lenguaje, definida en
    docker-compose.yml en la raíz del repo.

    A diferencia de correr-todos-los-tests.ps1, este script SÍ puede correr
    p1-java y p1-kotlin, porque adentro de un contenedor Linux no existe el
    problema de loopback que bloquea a Gradle en Windows.

.PARAMETER SoloCrud
    Corre solo los seis CRUD del punto 3, sin Java ni Kotlin.

.PARAMETER Reconstruir
    Fuerza la reconstrucción de la imagen de PHP antes de correr.

.EXAMPLE
    .\scripts\docker-correr-todo.ps1

.EXAMPLE
    .\scripts\docker-correr-todo.ps1 -SoloCrud
#>

[CmdletBinding()]
param(
    [switch]$SoloCrud,
    [switch]$Reconstruir
)

$ErrorActionPreference = 'Continue'

$raiz = Split-Path -Parent $PSScriptRoot

# --- Comprobaciones previas ---

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host ''
    Write-Host '  [X] Docker no está instalado.' -ForegroundColor Red
    Write-Host '      winget install Docker.DockerDesktop' -ForegroundColor Yellow
    Write-Host ''
    exit 1
}

& docker info --format '{{.ServerVersion}}' *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host '  [X] Docker está instalado pero el daemon no responde.' -ForegroundColor Red
    Write-Host '      Abrí Docker Desktop y esperá a que diga "Engine running".' -ForegroundColor Yellow
    Write-Host ''
    exit 1
}

Push-Location $raiz

try {
    if ($Reconstruir) {
        Write-Host ''
        Write-Host '  == Reconstruyendo la imagen de PHP' -ForegroundColor Cyan
        & docker compose build --no-cache php
    }

    $suites = [ordered]@{
        'CRUD C# (xUnit)'        = @{ servicio = 'csharp'; tests = 17 }
        'CRUD Python (pytest)'   = @{ servicio = 'python'; tests = 16 }
        'CRUD React (Vitest)'    = @{ servicio = 'react'; tests = 21 }
        'CRUD PHP (PHPUnit)'     = @{ servicio = 'php'; tests = 18 }
        'CRUD Rust (cargo test)' = @{ servicio = 'rust'; tests = 18 }
        'CRUD Go (go test)'      = @{ servicio = 'go'; tests = 21 }
    }

    if (-not $SoloCrud) {
        $suites['JUnit Java (p1-java)'] = @{ servicio = 'java'; tests = 19 }
        $suites['JUnit Kotlin (p1-kotlin)'] = @{ servicio = 'kotlin'; tests = 7 }
    }

    $resumen = [System.Collections.Generic.List[object]]::new()

    foreach ($nombre in $suites.Keys) {
        $servicio = $suites[$nombre].servicio

        Write-Host ''
        Write-Host "  == $nombre  (docker compose run --rm $servicio)" -ForegroundColor Cyan

        & docker compose run --rm --quiet-pull $servicio
        $ok = $LASTEXITCODE -eq 0

        $resumen.Add([PSCustomObject]@{
            Suite  = $nombre
            Estado = if ($ok) { 'OK' } else { 'FALLO' }
            Tests  = if ($ok) { $suites[$nombre].tests } else { '-' }
        })
    }

    Write-Host ''
    Write-Host '  Resumen (en contenedores)' -ForegroundColor Cyan
    Write-Host '  -------------------------' -ForegroundColor Cyan
    $resumen | Format-Table -AutoSize

    $fallaron = @($resumen | Where-Object { $_.Estado -eq 'FALLO' })
    if ($fallaron.Count -gt 0) {
        Write-Host "  $($fallaron.Count) suíte(s) con fallas." -ForegroundColor Red
        exit 1
    }

    $total = ($resumen | Measure-Object -Property Tests -Sum).Sum
    Write-Host "  Todo verde: $($resumen.Count) suítes, $total tests. Sin un solo SDK instalado." -ForegroundColor Green
    Write-Host ''
} finally {
    Pop-Location
}
