param(
  [Parameter(Mandatory=$false)]
  [string]$Version = "v10.0_stable",

  [Parameter(Mandatory=$false)]
  [string]$OutDir = (Join-Path $HOME "Downloads"),

  [Parameter(Mandatory=$false)]
  [switch]$IncludeDist
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$ZipName = "breslov-academy-${Version}_${Stamp}.zip"
$OutPath = Join-Path $OutDir $ZipName

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Stage to a temp folder so we can inject BUILDINFO + checksums without polluting dev working tree
$Stage = Join-Path ([System.IO.Path]::GetTempPath()) ("breslov_stage_" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

$Exclude = @(
  "node_modules", ".git", ".next", "build", "coverage", ".turbo", ".cache", ".DS_Store"
)

Write-Host "Staging repo from $RepoRoot to $Stage"

# Copy repo contents excluding heavy folders
$Items = Get-ChildItem -LiteralPath $RepoRoot -Force
foreach ($item in $Items) {
  if ($Exclude -contains $item.Name) { continue }
  if (-not $IncludeDist -and $item.Name -eq "dist") { continue }
  Copy-Item -LiteralPath $item.FullName -Destination $Stage -Recurse -Force
}

# Capture git commit if present
$GitCommit = $null
try {
  $GitCommit = (git -C $RepoRoot rev-parse HEAD 2>$null)
} catch {}

# Write BUILDINFO.json
$BuildInfo = [ordered]@{
  version = $Version
  created_at = (Get-Date).ToString("o")
  git_commit = $GitCommit
  node = (node -v 2>$null)
  npm = (npm -v 2>$null)
}
$BuildInfo | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 (Join-Path $Stage "BUILDINFO.json")

# Write checksums.sha256
$checksumPath = Join-Path $Stage "checksums.sha256"
"# sha256 checksums" | Out-File -Encoding UTF8 $checksumPath

Get-ChildItem -LiteralPath $Stage -Recurse -File |
  Where-Object { $_.Name -ne "checksums.sha256" } |
  ForEach-Object {
    $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    $rel = $_.FullName.Substring($Stage.Path.Length).TrimStart("\\")
    ("{0}  {1}" -f $hash.Hash.ToLowerInvariant(), $rel) | Out-File -Encoding UTF8 -Append $checksumPath
  }

# Create ZIP
if (Test-Path $OutPath) { Remove-Item -LiteralPath $OutPath -Force }
Write-Host "Creating ZIP: $OutPath"
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $OutPath -Force

Write-Host "Done: $OutPath"
Write-Host "Cleaning stage: $Stage"
Remove-Item -LiteralPath $Stage -Recurse -Force
