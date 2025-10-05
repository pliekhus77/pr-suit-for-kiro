# Requirements Document: Steering Strategy NuGet Packages

## Introduction

This feature creates a suite of NuGet packages that distribute Kiro steering strategy files to .NET projects. Each strategy file will be packaged individually, allowing teams to selectively include only the guidance they need. When installed, these packages will automatically copy the strategy markdown files to the `.kiro/steering` folder in the consuming project, making them immediately available to Kiro agents.

The packages enable teams to quickly bootstrap their projects with industry best practices and standardized patterns without manually copying files or maintaining documentation separately.

## Requirements

### Requirement 1: Individual Strategy Packages

**User Story:** As a .NET developer, I want to install individual strategy packages via NuGet, so that I can include only the guidance relevant to my project without unnecessary files.

#### Acceptance Criteria

1. WHEN a developer installs a strategy package THEN the package SHALL copy the corresponding strategy markdown file to `.kiro/steering/` in their project
2. WHEN multiple strategy packages are installed THEN each package SHALL copy only its own strategy file without conflicts
3. WHEN a package is installed THEN the strategy file SHALL maintain its original filename and content
4. WHEN a package is uninstalled THEN the strategy file SHALL remain in the project (content files are not removed by NuGet)
5. IF the `.kiro/steering/` directory does not exist THEN the package SHALL create it during installation

### Requirement 2: Package Naming and Metadata

**User Story:** As a .NET developer, I want clearly named packages with proper metadata, so that I can easily discover and understand what each package provides.

#### Acceptance Criteria

1. WHEN browsing NuGet THEN each package SHALL follow the naming pattern `PragmaticRhino.Kiro.Steering.{StrategyName}`
2. WHEN viewing package details THEN the package SHALL display "Pragmatic Rhino" as the company/owner
3. WHEN viewing package details THEN the package SHALL display "Patrick Liekhus" as the author
4. WHEN viewing package details THEN the package SHALL include a clear description of the strategy it provides
5. WHEN viewing package details THEN the package SHALL include relevant tags for discoverability (e.g., "kiro", "steering", "best-practices", strategy-specific tags)
6. WHEN viewing package details THEN the package SHALL include a link to documentation or repository
7. WHEN viewing package details THEN the package SHALL specify the license (e.g., MIT)

### Requirement 3: Strategy Package Coverage

**User Story:** As a .NET developer, I want packages for all available steering strategies, so that I can access any guidance I need through NuGet.

#### Acceptance Criteria

1. WHEN searching for steering packages THEN there SHALL be a package for `strategy-4d-safe.md` named `PragmaticRhino.Kiro.Steering.4DSafe`
2. WHEN searching for steering packages THEN there SHALL be a package for `strategy-azure.md` named `PragmaticRhino.Kiro.Steering.Azure`
3. WHEN searching for steering packages THEN there SHALL be a package for `strategy-c4-model.md` named `PragmaticRhino.Kiro.Steering.C4Model`
4. WHEN searching for steering packages THEN there SHALL be a package for `strategy-devops.md` named `PragmaticRhino.Kiro.Steering.DevOps`
5. WHEN searching for steering packages THEN there SHALL be a package for `strategy-ea.md` named `PragmaticRhino.Kiro.Steering.EnterpriseArchitecture`
6. WHEN searching for steering packages THEN there SHALL be a package for `strategy-iac.md` named `PragmaticRhino.Kiro.Steering.InfrastructureAsCode`
7. WHEN searching for steering packages THEN there SHALL be a package for `strategy-security.md` named `PragmaticRhino.Kiro.Steering.Security`
8. WHEN searching for steering packages THEN there SHALL be a package for `strategy-tdd-bdd.md` named `PragmaticRhino.Kiro.Steering.TestDrivenDevelopment`

### Requirement 4: Content File Configuration

**User Story:** As a .NET developer, I want the strategy files to be properly configured as content files, so that they are copied to my project during package installation and included in source control.

#### Acceptance Criteria

1. WHEN a package is installed THEN the strategy file SHALL be configured as a content file in the NuGet package
2. WHEN a package is installed THEN the strategy file SHALL be copied to `.kiro/steering/` relative to the project root
3. WHEN a package is installed THEN the strategy file SHALL have the "Copy to Output Directory" setting as "Do not copy"
4. WHEN a package is installed THEN the strategy file SHALL be included in the project file with `<Content>` item type
5. WHEN the project is committed to source control THEN the strategy file SHALL be included (not in .gitignore)

### Requirement 5: Version Management

**User Story:** As a .NET developer, I want strategy packages to follow semantic versioning, so that I can manage updates and understand the impact of changes.

#### Acceptance Criteria

1. WHEN a package is published THEN it SHALL follow semantic versioning (MAJOR.MINOR.PATCH)
2. WHEN strategy content is updated with breaking changes THEN the MAJOR version SHALL be incremented
3. WHEN strategy content is updated with new guidance THEN the MINOR version SHALL be incremented
4. WHEN strategy content is updated with corrections/clarifications THEN the PATCH version SHALL be incremented
5. WHEN a package is updated THEN the package SHALL include release notes describing the changes

### Requirement 6: Meta Package for Complete Suite

**User Story:** As a .NET developer, I want a single meta-package that installs all steering strategies, so that I can quickly bootstrap a project with complete guidance.

#### Acceptance Criteria

1. WHEN searching for steering packages THEN there SHALL be a meta-package named `PragmaticRhino.Kiro.Steering.All`
2. WHEN the meta-package is installed THEN it SHALL install all 8 individual strategy packages as dependencies
3. WHEN the meta-package is installed THEN all 8 strategy files SHALL be copied to `.kiro/steering/`
4. WHEN the meta-package is updated THEN it SHALL reference the latest versions of all individual packages
5. WHEN viewing the meta-package details THEN it SHALL clearly indicate it includes all steering strategies

### Requirement 7: Documentation and Examples

**User Story:** As a .NET developer, I want clear documentation on how to use the steering packages, so that I can quickly understand installation and usage.

#### Acceptance Criteria

1. WHEN viewing any package on NuGet THEN it SHALL include a README with installation instructions
2. WHEN viewing any package on NuGet THEN it SHALL include a description of what the strategy provides
3. WHEN viewing any package on NuGet THEN it SHALL include examples of how Kiro uses the steering file
4. WHEN viewing the meta-package THEN it SHALL include a list of all included strategies
5. WHEN a package is installed THEN the strategy file SHALL contain front-matter indicating it should be "always" included by Kiro

### Requirement 8: Build and Packaging Automation

**User Story:** As a package maintainer, I want automated build and packaging processes, so that I can efficiently create and publish updates to all strategy packages.

#### Acceptance Criteria

1. WHEN building packages THEN the process SHALL be automated via MSBuild or scripts
2. WHEN building packages THEN all packages SHALL be created from a single build command
3. WHEN building packages THEN the version number SHALL be consistent across all packages
4. WHEN building packages THEN the strategy files SHALL be automatically included from the `.kiro/steering/` source directory
5. WHEN building packages THEN the output SHALL include all individual packages plus the meta-package

### Requirement 9: Package Validation

**User Story:** As a package maintainer, I want automated validation of package contents, so that I can ensure quality before publishing.

#### Acceptance Criteria

1. WHEN a package is built THEN it SHALL be validated to contain exactly one strategy markdown file
2. WHEN a package is built THEN it SHALL be validated to have correct metadata (author, company, description)
3. WHEN a package is built THEN it SHALL be validated to have the correct content file path (`.kiro/steering/`)
4. WHEN the meta-package is built THEN it SHALL be validated to reference all individual strategy packages
5. WHEN validation fails THEN the build SHALL fail with a clear error message

### Requirement 10: Compatibility and Dependencies

**User Story:** As a .NET developer, I want the steering packages to have minimal dependencies and broad compatibility, so that they work with any .NET project.

#### Acceptance Criteria

1. WHEN viewing package dependencies THEN individual strategy packages SHALL have zero runtime dependencies
2. WHEN viewing package dependencies THEN the meta-package SHALL only depend on the individual strategy packages
3. WHEN installing a package THEN it SHALL be compatible with .NET Standard 2.0 or higher (content-only packages)
4. WHEN installing a package THEN it SHALL work with any .NET project type (console, web, library, etc.)
5. WHEN installing a package THEN it SHALL not require any code changes to the consuming project
