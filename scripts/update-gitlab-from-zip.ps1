param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath,

  [Parameter(Mandatory=$true)]
  [string]$RepoUrl,

  [Parameter(Mandatory=$false)]
  [string]$RepoPath = (Join-Path $HOME "breslov-academy"),

  [Parameter(Mandatory=$false)]
  [string]$Branch = "update-from-zip",

  [Parameter(Mandatory=$false)]
  [string]$CommitMessage = "Update from ZIP"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ZipPath)) { throw "ZIP not found: $ZipPath" }

# Ensure repo exists
if (-not (Test-Path -LiteralPath $RepoPath)) {
  Write-Host "Cloning $RepoUrl -> $RepoPath"
  git clone $RepoUrl $RepoPath
}

Set-Location $RepoPath

# Ensure clean working state
try {
  $status = git status --porcelain
  if ($status) {
    Write-Host "Warning: repo has uncommitted changes; stashing"
    git stash -u
  }
} catch {}

# Create/switch branch
$existing = git branch --list $Branch
if ($existing) {
  git checkout $Branch
} else {
  git checkout -b $Branch
}

# Expand ZIP
$tmp = Join-Path $env:TEMP ("breslov_zip_" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
Write-Host "Expanding ZIP -> $tmp"
Expand-Archive -LiteralPath $ZipPath -DestinationPath $tmp -Force

# Detect extracted root folder
$children = Get-ChildItem -LiteralPath $tmp | Where-Object { $_.PSIsContainer } | Select-Object -First 1
if (-not $children) { throw "Could not detect extracted project folder in $tmp" }
$srcRoot = $children.FullName

Write-Host "Mirroring $srcRoot -> repo root"
# Mirror copy contents into repo root (excluding .git)
robocopy $srcRoot $RepoPath /MIR /XD ".git" "node_modules" "dist" "build" "coverage" > $null

git add -A
if (-not (git diff --cached --quiet)) {
  git commit -m $CommitMessage
  git push -u origin $Branch
  Write-Host "Pushed branch: $Branch"
} else {
  Write-Host "No changes to commit."
}

Write-Host "Cleaning temp: $tmp"
Remove-Item -LiteralPath $tmp -Recurse -Force
