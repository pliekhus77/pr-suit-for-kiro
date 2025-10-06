# Changelog

All notable changes to the "Pragmatic Rhino SUIT" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Extension icons and branding
- Comprehensive documentation with usage examples
- Performance optimizations for faster activation

## [0.1.0] - 2025-01-15

### Added
- **Framework Management**
  - Browse available frameworks from curated library
  - Install frameworks with one click
  - Update frameworks when new versions available
  - Remove installed frameworks
  - Detect customizations and offer backups before updates

- **Tree View**
  - View all steering documents organized by category
  - Strategies (Installed) - Framework-based strategies
  - Project (Team-Created) - Project-specific guidance
  - Custom (Team-Created) - Team-specific documents
  - Context menu actions (Open, Update, Remove, Rename, Delete)
  - Tooltips with framework name and last modified date
  - Icons for different document types

- **Custom Steering Documents**
  - Create custom steering documents with templates
  - Rename custom documents
  - Delete custom documents
  - Export to library (placeholder for future)

- **Validation**
  - Validate steering documents against quality standards
  - Check for required sections
  - Verify actionable guidance and examples
  - Validate markdown formatting
  - Show diagnostics in editor
  - Provide quick fixes for common issues

- **Workspace Initialization**
  - Initialize new Kiro workspaces
  - Create directory structure (.kiro/steering/, specs/, settings/, .metadata/)
  - Install recommended frameworks
  - Custom framework selection during initialization

- **Framework References**
  - View framework reference documentation
  - Code lens "View Framework Reference" in steering documents
  - Hover provider for framework-specific terms
  - Search across framework references
  - Initialize frameworks/ directory with reference docs

- **Available Frameworks**
  - TDD/BDD Testing Strategy
  - SABSA Security Strategy
  - C4 Model Architecture
  - Azure Hosting Strategy
  - DevOps CI/CD Strategy
  - Infrastructure as Code (Pulumi)
  - 4D SDLC + SAFe Work Management
  - Enterprise Architecture (TOGAF/Zachman)

### Technical
- TypeScript implementation with strict mode
- Jest unit tests with 80%+ coverage
- VS Code Extension Test Runner for integration tests
- File system operations abstraction
- Framework manifest with versioning
- Metadata tracking for installed frameworks
- Conflict detection and resolution
- Backup creation before updates

## [0.0.1] - 2025-01-01

### Added
- Initial project setup
- Basic extension structure
- Framework manifest schema

---

## Version History

### Version 0.1.0 (Current)
First public release with complete framework management features.

**Key Features:**
- 8 framework strategies available
- Full CRUD operations for steering documents
- Validation and quality checks
- Workspace initialization
- Tree view management

**Statistics:**
- 8 framework strategies
- 15+ commands
- 80%+ test coverage
- < 500ms activation time

### Upcoming Features (0.2.0)
- Framework marketplace with community contributions
- Visual framework composer
- Team sharing and synchronization
- AI-powered framework suggestions
- Enhanced validation rules
- Performance profiling tools

---

## Migration Guide

### From Manual Steering Management

If you've been manually creating steering documents:

1. **Backup your existing documents**
   ```bash
   cp -r .kiro/steering .kiro/steering.backup
   ```

2. **Install the extension**

3. **Browse frameworks** and install any that match your existing documents

4. **Compare and merge** your customizations with installed frameworks

5. **Rename custom documents** to use `custom-` prefix for clarity

---

## Breaking Changes

### None Yet
This is the first release, so no breaking changes.

### Future Breaking Changes
We will follow semantic versioning:
- **Major version** (1.0.0): Breaking changes to file structure or front-matter
- **Minor version** (0.2.0): New features, backward compatible
- **Patch version** (0.1.1): Bug fixes, backward compatible

---

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: https://github.com/pliekhus77/pr-suit-for-kiro/issues
- **Discussions**: https://github.com/pliekhus77/pr-suit-for-kiro/discussions
- **Email**: support@pragmaticrhino.com

---

## License

MIT License - See [LICENSE](LICENSE) file for details.
