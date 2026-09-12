<#
.SYNOPSIS
    Corre las suítes de test del repo y muestra un resumen.

.DESCRIPTION
    Por defecto corre los seis CRUD del punto 3 (C#, Python, React, PHP, Rust, Go).
    Con -ConJava agrega p1-java y p1-kotlin, que necesitan Gradle.

    Cada proyecto que no tenga su herramienta instalada se reporta como SALTEADO,
    no como fallo.

.EXAMPLE
    .\scripts\correr-todos-los-tests.ps1

.EXAMPLE
    .\scripts\correr-todos-los-tests.ps1 -ConJava
#>

[CmdletBinding()]
param(
    [switch]$ConJava
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

$resumen = [System.Collections.Generic.List[object]]::new()

function Invoke-Suite {
    param(
        [string]$Nombre,
        [string]$Carpeta,
        [string]$Requiere,
        [scriptblock]$Accion,
        [int]$TestsEsperados
    )

    Write-Host ''
    Write-Host "  == $Nombre" -ForegroundColor Cyan

    if ($Requiere -and -not (Get-Command $Requiere -ErrorAction SilentlyContinue)) {
        Write-Host "     salteado: falta '$Requiere'" -ForegroundColor DarkGray
        $resumen.Add([PSCustomObject]@{ Suite = $Nombre; Estado = 'SALTEADO'; Tests = '-' })
        return
    }

    Push-Location $Carpeta
    try {
        & $Accion
        $ok = $LASTEXITCODE -eq 0
    } catch {
        Write-Host "     error: $_" -ForegroundColor Red
        $ok = $false
    } finally {
        Pop-Location
    }

    $resumen.Add([PSCustomObject]@{
        Suite  = $Nombre
        Estado = if ($ok) { 'OK' } else { 'FALLO' }
        Tests  = if ($ok) { $TestsEsperados } else { '-' }
    })
}

Invoke-Suite -Nombre 'CRUD C# (xUnit)' -Carpeta (Join-Path $cruds 'csharp-dotnet') `
    -Requiere 'dotnet' -TestsEsperados 17 -Accion { & dotnet test --nologo }

Invoke-Suite -Nombre 'CRUD Python (pytest)' -Carpeta (Join-Path $cruds 'python') `
    -Requiere 'python' -TestsEsperados 16 -Accion {
        if (Test-Path '.\venv\Scripts\python.exe') { & .\venv\Scripts\python.exe -m pytest -v }
        else { & python -m pytest -v }
    }

Invoke-Suite -Nombre 'CRUD React (Vitest)' -Carpeta (Join-Path $cruds 'javascript-react') `
    -Requiere 'node' -TestsEsperados 21 -Accion { & npm.cmd test -- --run }

Invoke-Suite -Nombre 'CRUD PHP (PHPUnit)' -Carpeta (Join-Path $cruds 'php') `
    -Requiere 'php' -TestsEsperados 18 -Accion { & php vendor/bin/phpunit --testdox }

Invoke-Suite -Nombre 'CRUD Rust (cargo test)' -Carpeta (Join-Path $cruds 'rust') `
    -Requiere 'cargo' -TestsEsperados 18 -Accion { & cargo test }

Invoke-Suite -Nombre 'CRUD Go (go test)' -Carpeta (Join-Path $cruds 'go') `
    -Requiere 'go' -TestsEsperados 21 -Accion { & go test -v ./... }

if ($ConJava) {
    if (-not $env:JAVA_HOME) {
        $jdk = @(Get-ChildItem 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') }) |
            Select-Object -First 1
        if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
    }

    Invoke-Suite -Nombre 'JUnit Java (p1-java)' -Carpeta (Join-Path $practica 'p1-java') `
        -TestsEsperados 19 -Accion { & .\gradlew.bat test --console=plain }

    Invoke-Suite -Nombre 'JUnit Kotlin (p1-kotlin)' -Carpeta (Join-Path $practica 'p1-kotlin') `
        -TestsEsperados 7 -Accion { & .\gradlew.bat test --console=plain }
}

Write-Host ''
Write-Host '  Resumen' -ForegroundColor Cyan
Write-Host '  -------' -ForegroundColor Cyan
$resumen | Format-Table -AutoSize

$fallaron = @($resumen | Where-Object { $_.Estado -eq 'FALLO' })
if ($fallaron.Count -gt 0) {
    Write-Host "  $($fallaron.Count) suíte(s) con fallas." -ForegroundColor Red
    exit 1
}

$corridas = @($resumen | Where-Object { $_.Estado -eq 'OK' })
$total = ($corridas | Measure-Object -Property Tests -Sum).Sum
Write-Host "  Todo verde: $($corridas.Count) suítes, $total tests." -ForegroundColor Green
Write-Host ''
