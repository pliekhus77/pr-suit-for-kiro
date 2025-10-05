# Implementation Plan: Steering Strategy NuGet Packages

## Overview
This implementation plan creates a suite of NuGet packages that distribute Kiro steering strategy files to .NET projects. The plan follows a test-driven approach with incremental progress, ensuring each step builds on previous work.

---

## 1. Project Structure and Configuration

- [x] 1.1 Create build directory structure
  - Create `build/` directory in project root
  - Create `build/nuspec/` for NuSpec files
  - Create `build/readme/` for package-specific README files
  - Create `artifacts/packages/` for output .nupkg files
  - _Requirements: 8.4, 8.5_

- [x] 1.2 Create package configuration file
  - Create `build/package-config.json` with metadata for all 8 strategy packages
  - Include package names, IDs, source files, descriptions, and tags
  - Follow naming pattern: `PragmaticRhino.Kiro.Steering.{StrategyName}`
  - Map source files to package names per design specification
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1-3.8_

- [x] 1.3 Create .gitignore entries
  - Add `artifacts/` to .gitignore
  - Add `*.nupkg` to .gitignore (except in artifacts)
  - _Requirements: 8.5_

---

## 2. NuSpec File Generation

- [x] 2.1 Create NuSpec template for individual packages
  - Create base template following design specification
  - Include metadata: id, version, authors, owners, license, projectUrl, description, tags
  - Configure contentFiles section for .kiro/steering/ target
  - Set up files section to copy from source to contentFiles/any/any/.kiro/steering/
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4_

- [x] 2.2 Generate NuSpec files for all 8 individual packages
  - Create `build/nuspec/4DSafe.nuspec`
  - Create `build/nuspec/Azure.nuspec`
  - Create `build/nuspec/C4Model.nuspec`
  - Create `build/nuspec/DevOps.nuspec`
  - Create `build/nuspec/EnterpriseArchitecture.nuspec`
  - Create `build/nuspec/InfrastructureAsCode.nuspec`
  - Create `build/nuspec/Security.nuspec`
  - Create `build/nuspec/TestDrivenDevelopment.nuspec`
  - Use package-config.json data for each package
  - _Requirements: 3.1-3.8, 2.1-2.7_

- [x] 2.3 Create NuSpec file for meta-package
  - Create `build/nuspec/All.nuspec`
  - Include dependencies on all 8 individual packages
  - Set package ID to `PragmaticRhino.Kiro.Steering.All`
  - Include comprehensive description listing all included strategies
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

---

## 3. README File Generation

- [x] 3.1 Create README template
  - Define standard sections: Overview, Installation, Usage, What's Included, Examples
  - Include NuGet installation command format
  - Add section explaining how Kiro uses steering files
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 3.2 Generate README files for individual packages
  - Create package-specific README for each of 8 packages in `build/readme/`
  - Include strategy-specific description and benefits
  - Add installation instructions with package-specific command
  - Include example of how Kiro will use the steering file
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.3 Create README for meta-package
  - Create `build/readme/All.md`
  - List all 8 included strategies with brief descriptions
  - Explain that this installs complete suite
  - Include installation instructions
  - _Requirements: 7.4_

---

## 4. Build Automation Scripts

- [x] 4.1 Create main build script
  - Create `build/Build-Packages.ps1` PowerShell script
  - Accept parameters: Version (default "1.0.0"), Configuration (default "Release")
  - Load package configuration from package-config.json
  - Implement error handling with $ErrorActionPreference = "Stop"
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 4.2 Implement source file validation
  - Verify all 8 strategy markdown files exist in `.kiro/steering/`
  - Fail build with clear error if any source file is missing
  - Log which files are being validated
  - _Requirements: 8.4, 9.1_

- [x] 4.3 Implement NuSpec version update logic
  - Read each NuSpec file as XML
  - Update version element with provided version parameter
  - Save updated NuSpec file
  - _Requirements: 5.1, 8.3_

- [x] 4.4 Implement package creation logic
  - Loop through all individual packages from config
  - Execute `nuget pack` for each NuSpec file
  - Output packages to artifacts/packages/ directory
  - Check exit codes and fail on errors
  - _Requirements: 8.2, 8.5_

- [x] 4.5 Implement meta-package creation logic
  - Update All.nuspec with version parameter
  - Update all dependency versions to match
  - Execute `nuget pack` for meta-package
  - _Requirements: 6.4, 8.2_

- [x] 4.6 Add build reporting
  - Log progress for each package being built
  - Display success message with output directory
  - Use color-coded output (Cyan for progress, Green for success, Red for errors)
  - _Requirements: 8.5_

---

## 5. Package Validation Scripts

- [x] 5.1 Create validation script structure
  - Create `build/Validate-Packages.ps1` PowerShell script
  - Accept parameter: PackageDirectory (default "artifacts/packages")
  - Implement Test-PackageContent function
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5.2 Implement package extraction validation
  - Extract .nupkg to temporary directory
  - Verify content files exist in contentFiles path
  - Skip content validation for meta-package (All)
  - Clean up temporary directory after validation
  - _Requirements: 9.1_

- [x] 5.3 Implement metadata validation
  - Parse .nuspec file from extracted package
  - Verify authors = "Patrick Liekhus"
  - Verify owners = "Pragmatic Rhino"
  - Verify license, description, and tags are present
  - _Requirements: 9.2_

- [x] 5.4 Implement validation reporting
  - Loop through all .nupkg files in output directory
  - Display validation status for each package (✓ or ✗)
  - Collect failed packages and display summary
  - Exit with error code if any validation fails
  - _Requirements: 9.5_

- [x] 5.5 Implement meta-package dependency validation
  - For All.nupkg, verify it has 8 dependencies
  - Verify each dependency references correct package ID
  - Verify dependency versions match package version
  - _Requirements: 9.4_

---

## 6. Documentation and Usage

- [x] 6.1 Create main project README
  - Create `README.md` in project root
  - Document purpose and overview of package suite
  - Include quick start guide for using packages
  - Add links to individual package documentation
  - Document build and publish process
  - _Requirements: 7.1, 7.2_

- [x] 6.2 Create build documentation
  - Document how to run Build-Packages.ps1
  - Document how to run Validate-Packages.ps1
  - Include examples with different version numbers
  - Document prerequisites (NuGet CLI, PowerShell)
  - _Requirements: 8.1, 8.2_

- [x] 6.3 Create package usage examples
  - Document installation via Package Manager Console
  - Document installation via .NET CLI
  - Show example of installed file structure
  - Explain how Kiro discovers and uses steering files
  - _Requirements: 7.3, 7.5_

---

## 7. Testing and Validation

- [x] 7.1 Create test .NET project for validation
  - Create simple console app in `test-project/` directory
  - Add to .gitignore
  - Use for manual installation testing
  - _Requirements: 10.4_

- [x] 7.2 Test individual package installation (MANUAL - Requires NuGet CLI)
  - Build all packages with version 1.0.0-test
  - Install one individual package to test project
  - Verify file copied to `.kiro/steering/` directory
  - Verify file content matches source
  - Verify file has correct Content item type in .csproj
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.4, 10.1, 10.2, 10.3, 10.4_

- [x] 7.3 Test meta-package installation (MANUAL - Requires NuGet CLI)
  - Create fresh test project
  - Install meta-package
  - Verify all 8 strategy files are copied
  - Verify no duplicate files
  - Verify all files in correct location
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7.4 Test package uninstallation behavior (MANUAL - Requires NuGet CLI)
  - Install package to test project
  - Uninstall package
  - Verify strategy file remains in project (expected NuGet behavior)
  - Document this behavior in README
  - _Requirements: 1.4_

- [x] 7.5 Test version update scenario (MANUAL - Requires NuGet CLI)
  - Install package version 1.0.0-test
  - Build and install version 1.0.1-test
  - Verify file is updated (manual verification)
  - Document update behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7.6 Run validation script on built packages (MANUAL - Requires NuGet CLI)
  - Execute Validate-Packages.ps1
  - Verify all packages pass validation
  - Fix any validation failures
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

---

## 8. CI/CD Integration (Optional)

- [x]* 8.1 Create GitHub Actions workflow
  - Create `.github/workflows/build-packages.yml`
  - Trigger on tags matching `v*` pattern
  - Set up NuGet CLI
  - Extract version from tag
  - Run Build-Packages.ps1 with version
  - Run Validate-Packages.ps1
  - _Requirements: 8.1, 8.2_

- [x]* 8.2 Add NuGet publish step
  - Add step to push packages to NuGet.org
  - Use NUGET_API_KEY secret
  - Only run on successful validation
  - _Requirements: 8.5_

- [x]* 8.3 Add artifact upload
  - Upload built packages as workflow artifacts
  - Retain for 90 days
  - Allow manual download for testing
  - _Requirements: 8.5_

---

## 9. Release Preparation

- [x] 9.1 Create CHANGELOG.md
  - Document initial release (v1.0.0)
  - List all 8 included packages
  - Document features and capabilities
  - _Requirements: 5.5_

- [x] 9.2 Verify all source files have correct front-matter
  - Check each strategy file has `inclusion: always` in front-matter
  - Update any files missing proper front-matter
  - _Requirements: 7.5_

- [x] 9.3 Final validation checklist
  - All 8 strategy files exist and are up-to-date
  - All NuSpec files have correct metadata
  - All README files are complete
  - Build script runs successfully
  - Validation script passes all checks
  - Test installation works correctly
  - Documentation is complete
  - _Requirements: All requirements_

---

## Notes

- **Testing Strategy**: This implementation plan focuses on manual testing and validation scripts rather than automated unit tests, as these are content-only packages with no executable code.
- **Version Management**: Initial release will be v1.0.0. Follow semantic versioning for future updates.
- **Package Publishing**: Publishing to NuGet.org requires API key and is marked as optional (CI/CD section).
- **Compatibility**: Packages are content-only and compatible with any .NET project type (.NET Standard 2.0+).
