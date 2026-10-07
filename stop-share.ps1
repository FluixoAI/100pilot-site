$ErrorActionPreference = 'Stop'
$previewTools = Join-Path $PSScriptRoot '.preview-tools'
$previewPidFile = Join-Path $previewTools 'tunnel.pid'
if (-not (Test-Path -LiteralPath $previewPidFile)) {
    Write-Host 'Aucun lien temporaire enregistré.'
    return
}
$previewTunnelPid = [int](Get-Content -LiteralPath $previewPidFile)
$previewTunnelProcess = Get-Process -Id $previewTunnelPid -ErrorAction SilentlyContinue
if ($previewTunnelProcess) {
    $expectedBinary = Join-Path $previewTools 'cloudflared.exe'
    if ($previewTunnelProcess.Path -ne $expectedBinary) {
        throw 'Le processus ne correspond pas au tunnel de cet aperçu.'
    }
    Stop-Process -Id $previewTunnelPid
}
Write-Host 'Le lien Internet temporaire est arrêté. Le site local reste accessible.'
