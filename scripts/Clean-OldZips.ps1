# Script: Clean-OldZips.ps1
# Purpose: Keep only the 2 most recent Stable ZIPs in a folder (Windows 11 / PowerShell)
param(
  [Parameter(Mandatory=$false)]
  [string]$Path = (Get-Location).Path,

  [Parameter(Mandatory=$false)]
  [int]$Keep = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$zips = Get-ChildItem -Path $Path -Filter "*.zip" | Sort-Object CreationTime -Descending
if ($zips.Count -gt $Keep) {
  $zips[$Keep..($zips.Count-1)] | Remove-Item -Force -Verbose
}
Write-Host "Zip cleanup complete. Kept latest $Keep builds in $Path."
