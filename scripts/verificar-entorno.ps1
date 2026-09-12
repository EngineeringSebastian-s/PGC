<#
.SYNOPSIS
    Revisa que estén todas las herramientas necesarias para correr los proyectos del repo.

.DESCRIPTION
    No instala nada: solo informa qué hay, qué falta y con qué comando se instala.
    Correr antes de exponer.

.EXAMPLE
    .\scripts\verificar-entorno.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

# PHP y cargo instalados con winget no siempre quedan en el PATH de la sesión.
$rutasExtra = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "$env:USERPROFILE\.cargo\bin"
) | Where-Object { Test-Path $_ }

foreach ($ruta in $rutasExtra) {
    if ($env:Path -notlike "*$ruta*") { $env:Path = "$env:Path;$ruta" }
}

$resultados = [System.Collections.Generic.List[object]]::new()

function Add-Resultado {
    param(
        [string]$Herramienta,
        [ValidateSet('OK', 'FALTA', 'PARCIAL')][string]$Estado,
        [string]$Detalle,
        [string]$ParaQue,
        [string]$ComoResolver = ''
    )

    $resultados.Add([PSCustomObject]@{
        Herramienta  = $Herramienta
        Estado       = $Estado
        Detalle      = $Detalle
        ParaQue      = $ParaQue
        ComoResolver = $ComoResolver
    })
}

function Get-PrimeraLinea {
    param([string[]]$Salida)
    $linea = @($Salida | Where-Object { "$_".Trim() -ne '' }) | Select-Object -First 1
    return "$linea".Trim()
}

function Test-Simple {
    param(
        [string]$Herramienta,
        [string]$Comando,
        [string]$Flag = '--version',
        [string]$ParaQue,
        [string]$ComoResolver,
        [scriptblock]$LimpiarVersion = { param($texto) $texto }
    )

    if (-not (Get-Command $Comando -ErrorAction SilentlyContinue)) {
        Add-Resultado -Herramienta $Herramienta -Estado 'FALTA' -Detalle 'no está instalado' `
            -ParaQue $ParaQue -ComoResolver $ComoResolver
        return
    }

    try {
        $salida = @(& $Comando $Flag 2>&1 | ForEach-Object { "$_" })
        $version = & $LimpiarVersion (Get-PrimeraLinea $salida)
    } catch {
        $version = 'instalado'
    }

    Add-Resultado -Herramienta $Herramienta -Estado 'OK' -Detalle $version -ParaQue $ParaQue
}

Test-Simple -Herramienta 'Node.js' -Comando 'node' -ParaQue 'CRUD React + guía web' `
    -ComoResolver 'winget install OpenJS.NodeJS.LTS'

Test-Simple -Herramienta 'Python' -Comando 'python' -ParaQue 'CRUD Python' `
    -ComoResolver 'winget install Python.Python.3.12' `
    -LimpiarVersion { param($t) if ($t -match 'Python \d[\d.]*') { $Matches[0] } else { $t } }

Test-Simple -Herramienta 'Rust (cargo)' -Comando 'cargo' -ParaQue 'CRUD Rust' `
    -ComoResolver 'winget install Rustlang.Rustup' `
    -LimpiarVersion { param($t) if ($t -match 'cargo \d[\d.]*') { $Matches[0] } else { $t } }

Test-Simple -Herramienta 'PHP' -Comando 'php' -ParaQue 'CRUD PHP' `
    -ComoResolver 'winget install PHP.PHP.8.4' `
    -LimpiarVersion { param($t) if ($t -match 'PHP \d[\d.]*') { $Matches[0] } else { $t } }

Test-Simple -Herramienta 'Composer' -Comando 'composer' -ParaQue 'CRUD PHP (dependencias)' `
    -ComoResolver 'ver PracticeOne/crud-tdd/php/README.md' `
    -LimpiarVersion { param($t) if ($t -match 'Composer version \S+') { $Matches[0] } else { 'instalado' } }

# --- .NET: hace falta el SDK, no alcanza con el runtime ---
if (Get-Command dotnet -ErrorAction SilentlyContinue) {
    $sdks = @(& dotnet --list-sdks 2>$null | ForEach-Object { "$_" })
    if ($sdks.Count -gt 0) {
        $ultimo = ($sdks[$sdks.Count - 1] -split '\s+')[0]
        Add-Resultado -Herramienta '.NET SDK' -Estado 'OK' -Detalle $ultimo -ParaQue 'CRUD C#'
    } else {
        Add-Resultado -Herramienta '.NET SDK' -Estado 'FALTA' -Detalle 'solo runtime, sin SDK' `
            -ParaQue 'CRUD C#' -ComoResolver 'winget install Microsoft.DotNet.SDK.10'
    }
} else {
    Add-Resultado -Herramienta '.NET SDK' -Estado 'FALTA' -Detalle 'no está instalado' `
        -ParaQue 'CRUD C#' -ComoResolver 'winget install Microsoft.DotNet.SDK.10'
}

# --- Java: puede estar instalado sin estar en el PATH ---
$javaExe = $null
$jdkDirs = @(Get-ChildItem 'C:\Program Files\Java', 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Microsoft' `
        -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') })

if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaExe = (Get-Command java).Source
    $version = Get-PrimeraLinea @(& java -version 2>&1 | ForEach-Object { "$_" })
    Add-Resultado -Herramienta 'Java (JDK)' -Estado 'OK' -Detalle $version -ParaQue 'p1-java y p1-kotlin'
} elseif ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    $javaExe = Join-Path $env:JAVA_HOME 'bin\java.exe'
    Add-Resultado -Herramienta 'Java (JDK)' -Estado 'OK' -Detalle "por JAVA_HOME ($env:JAVA_HOME)" `
        -ParaQue 'p1-java y p1-kotlin'
} elseif ($jdkDirs.Count -gt 0) {
    $javaExe = Join-Path $jdkDirs[0].FullName 'bin\java.exe'
    Add-Resultado -Herramienta 'Java (JDK)' -Estado 'PARCIAL' -Detalle "instalado, pero fuera del PATH" `
        -ParaQue 'p1-java y p1-kotlin' -ComoResolver "`$env:JAVA_HOME = '$($jdkDirs[0].FullName)'"
} else {
    Add-Resultado -Herramienta 'Java (JDK)' -Estado 'FALTA' -Detalle 'no está instalado' `
        -ParaQue 'p1-java y p1-kotlin' -ComoResolver 'winget install Microsoft.OpenJDK.21'
}

# --- Salida ---
Write-Host ''
Write-Host '  Entorno del repo PGC' -ForegroundColor Cyan
Write-Host '  --------------------' -ForegroundColor Cyan
Write-Host ''

foreach ($r in $resultados) {
    $color = switch ($r.Estado) {
        'OK'      { 'Green' }
        'PARCIAL' { 'Yellow' }
        default   { 'Red' }
    }
    $marca = switch ($r.Estado) {
        'OK'      { '[ok] ' }
        'PARCIAL' { '[~]  ' }
        default   { '[X]  ' }
    }
    Write-Host ("  {0}{1,-14} {2,-34} {3}" -f $marca, $r.Herramienta, $r.Detalle, $r.ParaQue) -ForegroundColor $color
}

$pendientes = @($resultados | Where-Object { $_.Estado -ne 'OK' })
if ($pendientes.Count -gt 0) {
    Write-Host ''
    Write-Host '  Para resolver:' -ForegroundColor Yellow
    foreach ($p in $pendientes) {
        Write-Host ("    {0,-14} {1}" -f $p.Herramienta, $p.ComoResolver) -ForegroundColor Yellow
    }
}

# --- Chequeos finos: cosas que rompen la demo aunque la herramienta esté instalada ---
Write-Host ''
Write-Host '  Revisiones extra' -ForegroundColor Cyan
Write-Host '  ----------------' -ForegroundColor Cyan

if (Get-Command php -ErrorAction SilentlyContinue) {
    $ini = (& php --ini 2>&1 | Out-String)
    if ($ini -match 'Loaded Configuration File:\s*\(none\)') {
        Write-Host '  [X]  PHP no carga ningún php.ini: Composer y PHPUnit van a fallar.' -ForegroundColor Red
        Write-Host '       Cómo crearlo: PracticeOne/crud-tdd/php/README.md' -ForegroundColor Red
    } else {
        $modulos = @(& php -m 2>&1 | ForEach-Object { "$_".Trim() })
        $faltantes = @('mbstring', 'openssl', 'zip') | Where-Object { $modulos -notcontains $_ }
        if ($faltantes.Count -gt 0) {
            Write-Host "  [X]  A PHP le faltan extensiones: $($faltantes -join ', ')" -ForegroundColor Red
            Write-Host '       Cómo agregarlas: PracticeOne/crud-tdd/php/README.md' -ForegroundColor Red
        } else {
            Write-Host '  [ok] PHP carga php.ini con mbstring, openssl y zip.' -ForegroundColor Green
        }
    }
}

if (Test-Path (Join-Path (Split-Path -Parent $PSScriptRoot) 'PracticeOne\crud-tdd\php\vendor')) {
    Write-Host '  [ok] PHP con dependencias instaladas (vendor/).' -ForegroundColor Green
} else {
    Write-Host '  [~]  Falta correr "composer install" en crud-tdd/php.' -ForegroundColor Yellow
}

# Gradle necesita que la JVM pueda abrir un Selector de NIO sobre loopback.
if ($javaExe) {
    $prueba = Join-Path $env:TEMP 'PgcSelectorCheck.java'
    @'
import java.nio.channels.Selector;

public class PgcSelectorCheck {
    public static void main(String[] args) {
        try (Selector s = Selector.open()) {
            System.out.println("SELECTOR_OK");
        } catch (Throwable t) {
            System.out.println("SELECTOR_FAIL " + t);
        }
    }
}
'@ | Set-Content -Path $prueba -Encoding UTF8

    $salida = (& $javaExe $prueba 2>&1 | Out-String)
    Remove-Item $prueba -ErrorAction SilentlyContinue

    if ($salida -match 'SELECTOR_OK') {
        Write-Host '  [ok] La JVM abre conexiones loopback: Gradle debería arrancar.' -ForegroundColor Green
    } else {
        Write-Host '  [X]  La JVM NO puede abrir un Selector de NIO sobre loopback.' -ForegroundColor Red
        Write-Host '       Gradle va a fallar con "Unable to establish loopback connection".' -ForegroundColor Red
        Write-Host '       Ver PracticeOne/GUIA-EXPOSICION.md, sección "Problema conocido".' -ForegroundColor Red
    }
}

Write-Host ''
