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

# PHP instalado con winget no queda en el PATH: lo buscamos también en su carpeta.
$rutasExtra = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "$env:USERPROFILE\.cargo\bin"
) | Where-Object { Test-Path $_ }

foreach ($ruta in $rutasExtra) {
    if ($env:Path -notlike "*$ruta*") { $env:Path = "$env:Path;$ruta" }
}

function Test-Herramienta {
    param(
        [string]$Nombre,
        [string]$Comando,
        [string[]]$Args = @('--version'),
        [string]$ComoInstalar,
        [string]$ParaQue
    )

    $encontrado = Get-Command $Comando -ErrorAction SilentlyContinue
    $version = ''
    $ok = $false

    if ($encontrado) {
        try {
            $salida = & $Comando @Args 2>&1 | Select-Object -First 1
            $version = ($salida | Out-String).Trim()
            $ok = $true
        } catch {
            $version = 'instalado, pero no respondió'
        }
    }

    [PSCustomObject]@{
        Herramienta  = $Nombre
        Estado       = if ($ok) { 'OK' } else { 'FALTA' }
        Version      = $version
        ParaQue      = $ParaQue
        ComoInstalar = if ($ok) { '' } else { $ComoInstalar }
    }
}

Write-Host ''
Write-Host '  Entorno del repo PGC' -ForegroundColor Cyan
Write-Host '  --------------------' -ForegroundColor Cyan

$resultados = @(
    Test-Herramienta -Nombre 'Node.js' -Comando 'node' -ParaQue 'CRUD React + guia-web' `
        -ComoInstalar 'winget install OpenJS.NodeJS.LTS'
    Test-Herramienta -Nombre 'Python' -Comando 'python' -ParaQue 'CRUD Python' `
        -ComoInstalar 'winget install Python.Python.3.12'
    Test-Herramienta -Nombre 'Rust (cargo)' -Comando 'cargo' -ParaQue 'CRUD Rust' `
        -ComoInstalar 'winget install Rustlang.Rustup'
    Test-Herramienta -Nombre 'PHP' -Comando 'php' -ParaQue 'CRUD PHP' `
        -ComoInstalar 'winget install PHP.PHP.8.4'
    Test-Herramienta -Nombre 'Composer' -Comando 'composer' -ParaQue 'CRUD PHP (dependencias)' `
        -ComoInstalar 'ver PracticeOne/crud-tdd/php/README.md'
)

# .NET: hace falta el SDK, no alcanza con el runtime.
$dotnet = Get-Command dotnet -ErrorAction SilentlyContinue
$sdks = if ($dotnet) { @(& dotnet --list-sdks 2>$null) } else { @() }
$resultados += [PSCustomObject]@{
    Herramienta  = '.NET SDK'
    Estado       = if ($sdks.Count -gt 0) { 'OK' } else { 'FALTA' }
    Version      = if ($sdks.Count -gt 0) { ($sdks[-1] -split ' ')[0] } elseif ($dotnet) { 'solo runtime, sin SDK' } else { '' }
    ParaQue      = 'CRUD C#'
    ComoInstalar = if ($sdks.Count -gt 0) { '' } else { 'winget install Microsoft.DotNet.SDK.10' }
}

# Java: puede estar instalado sin estar en el PATH.
$java = Get-Command java -ErrorAction SilentlyContinue
$javaHome = $env:JAVA_HOME
$javaDirs = @(Get-ChildItem 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') })

$javaEstado = 'FALTA'
$javaVersion = ''
$javaFix = 'winget install Microsoft.OpenJDK.21'

if ($java) {
    $javaEstado = 'OK'
    $javaVersion = ((& java -version 2>&1 | Select-Object -First 1) | Out-String).Trim()
} elseif ($javaHome -and (Test-Path (Join-Path $javaHome 'bin\java.exe'))) {
    $javaEstado = 'OK'
    $javaVersion = "via JAVA_HOME: $javaHome"
} elseif ($javaDirs.Count -gt 0) {
    $javaEstado = 'PARCIAL'
    $javaVersion = "instalado en $($javaDirs[0].FullName), pero no está en el PATH"
    $javaFix = "`$env:JAVA_HOME = '$($javaDirs[0].FullName)'"
}

$resultados += [PSCustomObject]@{
    Herramienta  = 'Java (JDK)'
    Estado       = $javaEstado
    Version      = $javaVersion
    ParaQue      = 'p1-java y p1-kotlin'
    ComoInstalar = if ($javaEstado -eq 'OK') { '' } else { $javaFix }
}

$resultados | Format-Table -AutoSize -Property Herramienta, Estado, Version, ParaQue

$faltan = @($resultados | Where-Object { $_.Estado -ne 'OK' })
if ($faltan.Count -gt 0) {
    Write-Host '  Falta instalar:' -ForegroundColor Yellow
    foreach ($f in $faltan) {
        Write-Host ("    {0,-14} -> {1}" -f $f.Herramienta, $f.ComoInstalar) -ForegroundColor Yellow
    }
    Write-Host ''
} else {
    Write-Host '  Todo listo.' -ForegroundColor Green
    Write-Host ''
}

# --- Chequeos finos que rompen la demo aunque la herramienta esté instalada ---

Write-Host '  Revisiones extra' -ForegroundColor Cyan
Write-Host '  ----------------' -ForegroundColor Cyan

if (Get-Command php -ErrorAction SilentlyContinue) {
    $ini = (& php --ini 2>&1 | Out-String)
    if ($ini -match 'Loaded Configuration File:\s+\(none\)') {
        Write-Host '  [!] PHP no carga ningún php.ini: Composer y PHPUnit van a fallar.' -ForegroundColor Yellow
        Write-Host '      Ver PracticeOne/crud-tdd/php/README.md para crearlo.' -ForegroundColor Yellow
    } else {
        $modulos = (& php -m 2>&1 | Out-String)
        $faltantes = @('mbstring', 'openssl', 'zip') | Where-Object { $modulos -notmatch "(?im)^$_$" }
        if ($faltantes.Count -gt 0) {
            Write-Host "  [!] A PHP le faltan extensiones: $($faltantes -join ', ')" -ForegroundColor Yellow
        } else {
            Write-Host '  [ok] PHP con php.ini y extensiones cargadas.' -ForegroundColor Green
        }
    }
}

# Gradle necesita que la JVM pueda abrir un Selector de NIO sobre loopback.
$javaExe = $null
if ($java) { $javaExe = 'java' }
elseif ($javaHome -and (Test-Path (Join-Path $javaHome 'bin\java.exe'))) { $javaExe = Join-Path $javaHome 'bin\java.exe' }
elseif ($javaDirs.Count -gt 0) { $javaExe = Join-Path $javaDirs[0].FullName 'bin\java.exe' }

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
        Write-Host '  [!] La JVM NO puede abrir un Selector de NIO sobre loopback.' -ForegroundColor Red
        Write-Host '      Gradle va a fallar con "Unable to establish loopback connection".' -ForegroundColor Red
        Write-Host '      Ver PracticeOne/GUIA-EXPOSICION.md (problema conocido).' -ForegroundColor Red
    }
}

Write-Host ''
