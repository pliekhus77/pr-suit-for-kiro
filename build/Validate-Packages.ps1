# Validate-Packages.ps1
# Validates NuGet packages for Kiro steering strategies

param(
    [string]$PackageDirectory = "artifacts/packages"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Kiro Steering Packages Validation ===" -ForegroundColor Cyan
Write-Host "Package Directory: $PackageDirectory" -ForegroundColor Cyan
Write-Host ""

# Check if package directory exists
if (-not (Test-Path $PackageDirectory)) {
    Write-Host "ERROR: Package directory not found: $PackageDirectory" -ForegroundColor Red
    exit 1
}

function Test-PackageContent {
    param([string]$PackagePath)
    
    $packageName = [System.IO.Path]::GetFileNameWithoutExtension($PackagePath)
    $tempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    try {
        # Extract package (nupkg is just a zip file)
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($PackagePath, $tempDir)
        
        # Check for content files (skip for meta-package)
        if ($packageName -notlike "*All*") {
            $contentFiles = Get-ChildItem -Path $tempDir -Recurse -Filter "*.md" | 
                Where-Object { $_.FullName -like "*contentFiles*" }
            
            if ($contentFiles.Count -eq 0) {
                throw "No content files found in package"
            }
            
            # Verify content file is in correct path
            $correctPath = $contentFiles | Where-Object { 
                $_.FullName -like "*contentFiles*any*any*.kiro*steering*" 
            }
            
            if (-not $correctPath) {
                throw "Content file not in correct path (.kiro/steering/)"
            }
        }
        
        # Check nuspec
        $nuspec = Get-ChildItem -Path $tempDir -Filter "*.nuspec" | Select-Object -First 1
        if (-not $nuspec) {
            throw "No nuspec file found in package"
        }
        
        $nuspecXml = [xml](Get-Content $nuspec.FullName)
        
        # Validate metadata
        if ([string]::IsNullOrWhiteSpace($nuspecXml.package.metadata.authors)) {
            throw "Authors not specified"
        }
        
        if ($nuspecXml.package.metadata.authors -ne "Patrick Liekhus") {
            throw "Incorrect author: $($nuspecXml.package.metadata.authors)"
        }
        
        if ([string]::IsNullOrWhiteSpace($nuspecXml.package.metadata.owners)) {
            throw "Owners not specified"
        }
        
        if ($nuspecXml.package.metadata.owners -ne "Pragmatic Rhino") {
            throw "Incorrect owner: $($nuspecXml.package.metadata.owners)"
        }
        
        if ([string]::IsNullOrWhiteSpace($nuspecXml.package.metadata.license)) {
            throw "License not specified"
        }
        
        if ([string]::IsNullOrWhiteSpace($nuspecXml.package.metadata.description)) {
            throw "Description not specified"
        }
        
        if ([string]::IsNullOrWhiteSpace($nuspecXml.package.metadata.tags)) {
            throw "Tags not specified"
        }
        
        # Validate meta-package dependencies
        if ($packageName -like "*All*") {
            $dependencies = $nuspecXml.package.metadata.dependencies.dependency
            
            if ($dependencies.Count -ne 8) {
                throw "Meta-package should have 8 dependencies, found $($dependencies.Count)"
            }
            
            # Expected package IDs
            $expectedPackages = @(
                "PragmaticRhino.Kiro.Steering.4DSafe",
                "PragmaticRhino.Kiro.Steering.Azure",
                "PragmaticRhino.Kiro.Steering.C4Model",
                "PragmaticRhino.Kiro.Steering.DevOps",
                "PragmaticRhino.Kiro.Steering.EnterpriseArchitecture",
                "PragmaticRhino.Kiro.Steering.InfrastructureAsCode",
                "PragmaticRhino.Kiro.Steering.Security",
                "PragmaticRhino.Kiro.Steering.TestDrivenDevelopment"
            )
            
            foreach ($expectedPkg in $expectedPackages) {
                $found = $dependencies | Where-Object { $_.id -eq $expectedPkg }
                if (-not $found) {
                    throw "Missing dependency: $expectedPkg"
                }
            }
            
            # Verify all dependencies have same version
            $versions = $dependencies | Select-Object -ExpandProperty version -Unique
            if ($versions.Count -gt 1) {
                throw "Dependencies have inconsistent versions: $($versions -join ', ')"
            }
        }
        
        return $true
    }
    finally {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Validate all packages
$packages = Get-ChildItem -Path $PackageDirectory -Filter "*.nupkg"
$failed = @()
$passed = @()

if ($packages.Count -eq 0) {
    Write-Host "WARNING: No packages found in $PackageDirectory" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($packages.Count) package(s) to validate" -ForegroundColor Cyan
Write-Host ""

foreach ($package in $packages) {
    Write-Host "Validating $($package.Name)..." -ForegroundColor Cyan
    try {
        Test-PackageContent -PackagePath $package.FullName
        Write-Host "  [OK] Valid" -ForegroundColor Green
        $passed += $package.Name
    }
    catch {
        Write-Host "  [X] Failed: $_" -ForegroundColor Red
        $failed += $package.Name
    }
}

# Summary
Write-Host ""
Write-Host "=== Validation Summary ===" -ForegroundColor Cyan
Write-Host "Total packages: $($packages.Count)" -ForegroundColor Cyan
Write-Host "Passed: $($passed.Count)" -ForegroundColor Green
Write-Host "Failed: $($failed.Count)" -ForegroundColor $(if ($failed.Count -gt 0) { "Red" } else { "Green" })

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed packages:" -ForegroundColor Red
    foreach ($pkg in $failed) {
        Write-Host "  [X] $pkg" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Validation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All packages validated successfully!" -ForegroundColor Green
