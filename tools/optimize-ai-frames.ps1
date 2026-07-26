param(
  [string]$Source = "Scroll-images-ai",
  [string]$Destination = "Scroll-images-ai-web",
  [long]$Quality = 82
)

Add-Type -AssemblyName System.Drawing
$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$destinationPath = Join-Path (Get-Location) $Destination
New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object MimeType -eq "image/jpeg"
$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $Quality
)

$frames = Get-ChildItem -LiteralPath $sourcePath -Filter "*.jpg" -File | Sort-Object Name
foreach ($frame in $frames) {
  $image = [System.Drawing.Image]::FromFile($frame.FullName)
  try {
    $image.Save((Join-Path $destinationPath $frame.Name), $codec, $parameters)
  } finally {
    $image.Dispose()
  }
}

$parameters.Dispose()
Write-Output "Optimized $($frames.Count) AI frames to $destinationPath"
