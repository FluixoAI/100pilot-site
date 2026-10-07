$ErrorActionPreference = 'Stop'
$siteNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $siteNode)) {
    $siteNode = (Get-Command node -ErrorAction Stop).Source
}
Push-Location -LiteralPath $PSScriptRoot
try {
    & $siteNode 'build.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'La génération du site a échoué.' }
    Write-Host 'Aperçu local : http://127.0.0.1:18762/'
    Write-Host 'Arrêt : Ctrl+C dans ce terminal.'
    & $siteNode 'serve.mjs'
} finally {
    Pop-Location
}
