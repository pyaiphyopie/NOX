# Download and install Flutter SDK for Windows
# This script downloads the latest stable Flutter SDK, extracts it to C:\flutter, and adds it to PATH

$url = 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.0-stable.zip'
$out = Join-Path $env:TEMP 'flutter_windows_3.24.0-stable.zip'
$extractPath = 'C:\flutter'

# Download Flutter SDK
Write-Output 'Downloading Flutter SDK...'
Invoke-WebRequest -Uri $url -OutFile $out

# Extract to C:\flutter
Write-Output 'Extracting Flutter SDK...'
Expand-Archive -Path $out -DestinationPath $extractPath -Force

# Add to PATH (user level)
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike '*C:\flutter\bin*') {
    $newPath = $userPath + ';C:\flutter\bin'
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Output 'Added Flutter to PATH. You may need to restart your terminal.'
}

# Clean up
Remove-Item $out -Force

Write-Output 'Flutter installation complete. Run "flutter doctor" to verify setup.'
Write-Output 'INSTALL_DONE'