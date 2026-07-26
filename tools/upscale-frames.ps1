param(
  [string]$Source = "Scroll-images",
  [string]$Destination = "Scroll-images-upscaled",
  [int]$Scale = 2,
  [long]$Quality = 90
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$destinationPath = Join-Path (Get-Location) $Destination
New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object MimeType -eq "image/jpeg"
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $Quality
)

$frames = Get-ChildItem -LiteralPath $sourcePath -Filter "*.jpg" -File | Sort-Object Name
foreach ($frame in $frames) {
  $sourceImage = [System.Drawing.Image]::FromFile($frame.FullName)
  try {
    $width = $sourceImage.Width * $Scale
    $height = $sourceImage.Height * $Scale
    $output = New-Object System.Drawing.Bitmap($width, $height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }
      $output.Save((Join-Path $destinationPath $frame.Name), $jpegCodec, $encoderParameters)
    } finally {
      $output.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

$encoderParameters.Dispose()
Write-Output "Upscaled $($frames.Count) frames to $destinationPath"
