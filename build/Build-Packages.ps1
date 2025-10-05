# Build-Packages.ps1
# Builds all NuGet packages for Kiro steering strategies

param(
    [string]$Version = "1.0.0",
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

# Configuration
$sourceDir = ".kiro/steering"
$nuspecDir = "build/nuspec"
$outputDir = "artifacts/packages"
$configFile = "build/package-config.json"

Write-Host "=== Kiro Steering Packages Build ===" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
Write-Host ""

# Load package configuration
Write-Host "Loading package configuration..." -ForegroundColor Cyan
if (-not (Test-Path $configFile)) {
    Write-Host "ERROR: Configuration file not found: $configFile" -ForegroundColor Red
    exit 1
}

$config = Get-Content $configFile | ConvertFrom-Json
Write-Host "Loaded configuration for $($config.packages.Count) packages" -ForegroundColor Green
Write-Host ""

# Validate source files exist
Write-Host "Validating source files..." -ForegroundColor Cyan
$missingFiles = @()

foreach ($package in $config.packages) {
    $sourceFile = Join-Path $sourceDir $package.sourceFile
    Write-Host "  Checking: $($package.sourceFile)" -ForegroundColor Gray
    
    if (-not (Test-Path $sourceFile)) {
        $missingFiles += $package.sourceFile
        Write-Host "    [X] Missing" -ForegroundColor Red
    } else {
        Write-Host "    [OK] Found" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "ERROR: Missing source files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "All source files validated successfully" -ForegroundColor Green
Write-Host ""

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Update NuSpec versions and build individual packages
Write-Host "Building individual packages..." -ForegroundColor Cyan
$builtPackages = @()

foreach ($package in $config.packages) {
    Write-Host ""
    Write-Host "Building $($package.id)..." -ForegroundColor Cyan
    
    # Update version in nuspec
    $nuspecFile = Join-Path $nuspecDir "$($package.name).nuspec"
    
    if (-not (Test-Path $nuspecFile)) {
        Write-Host "  ERROR: NuSpec file not found: $nuspecFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  Updating version to $Version..." -ForegroundColor Gray
    $nuspec = [xml](Get-Content $nuspecFile)
    $nuspec.package.metadata.version = $Version
    $nuspec.Save($nuspecFile)
    
    # Pack the package
    Write-Host "  Packing package..." -ForegroundColor Gray
    $packOutput = nuget pack $nuspecFile -OutputDirectory $outputDir -Version $Version 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to pack $($package.id)" -ForegroundColor Red
        Write-Host $packOutput -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  [OK] Package created successfully" -ForegroundColor Green
    $builtPackages += $package.id
}

Write-Host ""
Write-Host "Building meta-package..." -ForegroundColor Cyan

# Update meta-package version and dependencies
$metaNuspec = Join-Path $nuspecDir "All.nuspec"

if (-not (Test-Path $metaNuspec)) {
    Write-Host "  ERROR: Meta-package NuSpec not found: $metaNuspec" -ForegroundColor Red
    exit 1
}

Write-Host "  Updating version to $Version..." -ForegroundColor Gray
$metaNuspecXml = [xml](Get-Content $metaNuspec)
$metaNuspecXml.package.metadata.version = $Version

# Update dependency versions
Write-Host "  Updating dependency versions..." -ForegroundColor Gray
foreach ($dep in $metaNuspecXml.package.metadata.dependencies.dependency) {
    $dep.version = $Version
}
$metaNuspecXml.Save($metaNuspec)

# Pack meta-package
Write-Host "  Packing meta-package..." -ForegroundColor Gray
$metaPackOutput = nuget pack $metaNuspec -OutputDirectory $outputDir -Version $Version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to pack meta-package" -ForegroundColor Red
    Write-Host $metaPackOutput -ForegroundColor Red
    exit 1
}

Write-Host "  [OK] Meta-package created successfully" -ForegroundColor Green

# Build summary
Write-Host ""
Write-Host "=== Build Summary ===" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Green
Write-Host "Packages built: $($builtPackages.Count + 1)" -ForegroundColor Green
Write-Host "Output directory: $outputDir" -ForegroundColor Green
Write-Host ""
Write-Host "Individual packages:" -ForegroundColor Green
foreach ($pkg in $builtPackages) {
    Write-Host "  [OK] $pkg" -ForegroundColor Green
}
Write-Host "  [OK] PragmaticRhino.Kiro.Steering.All (meta-package)" -ForegroundColor Green
Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
