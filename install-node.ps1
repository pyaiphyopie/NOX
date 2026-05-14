$url = 'https://nodejs.org/dist/v24.15.0/node-v24.15.0-x64.msi'
$out = Join-Path $env:TEMP 'node-v24.15.0-x64.msi'
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process msiexec.exe -ArgumentList "/i`"$out`" /qn /norestart" -Wait -NoNewWindow
Write-Output 'INSTALL_DONE'
Get-Command node -ErrorAction SilentlyContinue | Select-Object Name,Source
Get-Command npm -ErrorAction SilentlyContinue | Select-Object Name,Source
