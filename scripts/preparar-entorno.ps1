<#
.SYNOPSIS
    Instala las dependencias de los proyectos del repo.

.DESCRIPTION
    No instala compiladores ni SDKs (para eso, correr primero verificar-entorno.ps1 y seguir
    sus indicaciones). Esto baja las dependencias de cada proyecto: NuGet, pip, npm, Composer,
    cargo y el wrapper de Gradle.

    Saltea en silencio los proyectos cuya herramienta no esté instalada.

.EXAMPLE
    .\scripts\preparar-entorno.ps1
#>

[CmdletBinding()]
param(
    [switch]$SinGradle
)

$ErrorActionPreference = 'Continue'

$raiz = Split-Path -Parent $PSScriptRoot
$practica = Join-Path $raiz 'PracticeOne'
$cruds = Join-Path $practica 'crud-tdd'

$rutasExtra = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "$env:USERPROFILE\.cargo\bin",
    "$env:ProgramFiles\Go\bin"
) | Where-Object { Test-Path $_ }

foreach ($ruta in $rutasExtra) {
    if ($env:Path -notlike "*$ruta*") { $env:Path = "$env:Path;$ruta" }
}

function Write-Paso {
    param([string]$Texto)
    Write-Host ''
    Write-Host "  == $Texto" -ForegroundColor Cyan
}

function Write-Saltado {
    param([string]$Texto)
    Write-Host "     (salteado: $Texto)" -ForegroundColor DarkGray
}

# --- C# ---
Write-Paso '.NET — restaurando paquetes'
if ((Get-Command dotnet -ErrorAction SilentlyContinue) -and (@(& dotnet --list-sdks 2>$null).Count -gt 0)) {
    Push-Location (Join-Path $cruds 'csharp-dotnet')
    & dotnet restore
    Pop-Location
} else {
    Write-Saltado 'falta el .NET SDK'
}

# --- Python ---
Write-Paso 'Python — creando venv e instalando pytest'
if (Get-Command python -ErrorAction SilentlyContinue) {
    Push-Location (Join-Path $cruds 'python')
    if (-not (Test-Path 'venv')) { & python -m venv venv }
    & .\venv\Scripts\python.exe -m pip install --quiet --upgrade pip
    & .\venv\Scripts\python.exe -m pip install -r requirements.txt
    Pop-Location
} else {
    Write-Saltado 'falta Python'
}

# --- Node ---
Write-Paso 'Node — instalando dependencias (CRUD React y guía web)'
if (Get-Command node -ErrorAction SilentlyContinue) {
    foreach ($proyecto in @((Join-Path $cruds 'javascript-react'), (Join-Path $practica 'guia-web'))) {
        Write-Host "     $proyecto" -ForegroundColor DarkGray
        Push-Location $proyecto
        & npm.cmd install --no-audit --no-fund
        Pop-Location
    }
} else {
    Write-Saltado 'falta Node.js'
}

# --- PHP ---
Write-Paso 'PHP — composer install'
if (Get-Command composer -ErrorAction SilentlyContinue) {
    Push-Location (Join-Path $cruds 'php')
    & composer install --no-interaction
    Pop-Location
} else {
    Write-Saltado 'falta Composer'
}

# --- Rust ---
Write-Paso 'Rust — cargo build'
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Push-Location (Join-Path $cruds 'rust')
    & cargo build
    Pop-Location
} else {
    Write-Saltado 'falta Rust'
}

# --- Go ---
Write-Paso 'Go — go build'
if (Get-Command go -ErrorAction SilentlyContinue) {
    Push-Location (Join-Path $cruds 'go')
    & go build ./...
    Pop-Location
} else {
    Write-Saltado 'falta Go'
}

# --- Java / Kotlin ---
if (-not $SinGradle) {
    Write-Paso 'Java/Kotlin — bajando el wrapper de Gradle (puede tardar varios minutos)'

    if (-not $env:JAVA_HOME) {
        $jdk = @(Get-ChildItem 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') }) |
            Select-Object -First 1
        if ($jdk) {
            $env:JAVA_HOME = $jdk.FullName
            Write-Host "     JAVA_HOME = $env:JAVA_HOME" -ForegroundColor DarkGray
        }
    }

    if ($env:JAVA_HOME -or (Get-Command java -ErrorAction SilentlyContinue)) {
        foreach ($proyecto in @((Join-Path $practica 'p1-java'), (Join-Path $practica 'p1-kotlin'))) {
            Write-Host "     $proyecto" -ForegroundColor DarkGray
            Push-Location $proyecto
            & .\gradlew.bat --version --console=plain
            Pop-Location
        }
    } else {
        Write-Saltado 'falta un JDK'
    }
} else {
    Write-Paso 'Java/Kotlin — salteado (-SinGradle)'
}

Write-Host ''
Write-Host '  Listo. Ahora: .\scripts\correr-todos-los-tests.ps1' -ForegroundColor Green
Write-Host ''
