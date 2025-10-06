# Project Scope Update: Focus on VS Code Extension

**Date:** January 10, 2025  
**Status:** Complete  
**Impact:** Documentation and project structure

## Summary

The Pragmatic Rhino SUIT project has been updated to focus exclusively on the VS Code Extension. All references to future NuGet packages and .NET libraries have been removed from documentation and project files.

## Changes Made

### Documentation Updates

#### 1. `.kiro/steering/product.md`
- **Mission**: Removed "Future: Complement with .NET NuGet libraries for runtime patterns"
- **Project Scope**: Removed "Phase 2: NuGet Libraries (Future)" section
- **Success Metrics**: Changed from "NuGet download count" to "Extension installs, active users"
- **Common Patterns**: Updated from .NET patterns (IOptions<T>, ILogger<T>) to VS Code extension patterns
- **Anti-Patterns**: Updated from .NET anti-patterns to extension-specific ones

#### 2. `.kiro/steering/tech.md`
- **Primary Languages**: Removed "C#: Future NuGet libraries (Phase 2)"
- **Dependency Management**: Changed from "NuGet Package Guidelines" to "npm Package Guidelines"
- **Common Dependencies**: Changed from Microsoft.Extensions.* to @types/vscode, jest, etc.
- **Release Pipeline**: Changed from "Publish to NuGet.org" to "Publish to VS Code Marketplace"

#### 3. `.kiro/steering/structure.md`
- **Purpose**: Changed from ".NET NuGet libraries" to "VS Code extension development"
- **Repository Structure**: Updated to show extension structure (src/, tests/, resources/)
- **Source Code Organization**: Changed from C# feature folders to TypeScript extension structure
- **Naming Conventions**: Changed from C# conventions to TypeScript conventions
- **Project Files**: Changed from .csproj to package.json and tsconfig.json

#### 4. `README.md`
- **Overview**: Changed "package manager" to "framework manager" (more accurate)
- **Contributing**: Added coverage report command
- **Development Setup**: Clarified extension-specific workflows

#### 5. `CONTRIBUTING.md`
- **Contributing Frameworks**: Added step to create steering template in resources/

#### 6. `CHANGELOG.md`
- **Migration Guide**: Removed "From NuGet Packages" section (not applicable)

#### 7. `.gitignore`
- Removed NuGet-specific entries (*.nupkg)

### Spec Updates

#### 8. `.kiro/specs/steering-packages/`
- Created `DEPRECATED.md` to document why this spec is no longer active
- Explained migration path to VS Code Extension
- Retained files for historical reference

## Rationale

### Why Focus on VS Code Extension Only

1. **Better User Experience**: Interactive browsing, installation, and updates through VS Code UI
2. **Cross-Platform**: Works with any language/framework, not just .NET projects
3. **Richer Features**: Validation, previews, tree views, webviews, diagnostics
4. **Easier Maintenance**: Single codebase vs. multiple NuGet packages
5. **Faster Iteration**: No need to publish to NuGet.org for updates
6. **Broader Adoption**: VS Code is more widely used than .NET-specific tooling

### What This Means

**In Scope:**
- VS Code extension development and features
- Framework management (browse, install, update)
- Workspace validation and guidance
- Spec scaffolding and management
- C4 diagram generation
- Hook creation and testing
- MCP configuration UI

**Out of Scope:**
- .NET NuGet packages
- Runtime libraries or components
- Language-specific implementations
- Application-specific business logic

## Impact Assessment

### Low Impact Areas
- **Existing Extension Code**: No changes needed (already focused on extension)
- **Framework Content**: No changes needed (language-agnostic guidance)
- **User Experience**: No changes (users only interact with extension)

### Medium Impact Areas
- **Documentation**: Updated to remove .NET references (completed)
- **Project Structure**: Already aligned with extension development
- **Testing Strategy**: Already using Jest and VS Code test framework

### No Impact Areas
- **Active Development**: Current work on framework management continues unchanged
- **Roadmap**: Extension features remain the priority
- **User Base**: Target audience unchanged (Kiro users)

## Verification

### Documentation Consistency
- [x] All steering documents updated
- [x] README reflects extension-only scope
- [x] CONTRIBUTING guide updated
- [x] CHANGELOG cleaned up
- [x] .gitignore updated

### Spec Status
- [x] steering-packages spec marked as deprecated
- [x] framework-steering-management spec remains active
- [x] c4-model-expansion spec remains active

### No Broken References
- [x] No references to NuGet in active documentation
- [x] No references to .NET libraries in product scope
- [x] No references to Phase 2 in mission statement

## Next Steps

1. **Continue Extension Development**: Focus on completing framework management features
2. **Update Roadmap**: Ensure roadmap reflects extension-only scope
3. **Review ADRs**: Check if any ADRs reference .NET and update if needed
4. **Cleanup**: Consider removing steering-packages spec in future cleanup

## Questions & Answers

**Q: Will we ever support .NET libraries?**  
A: Not in the foreseeable future. The extension provides better value and broader reach.

**Q: What about users who want .NET-specific guidance?**  
A: Framework content can include .NET-specific best practices (e.g., in tech.md steering), but delivery is through the extension.

**Q: Can we still reference .NET patterns in framework content?**  
A: Yes! Framework content (in `frameworks/` directory) can reference any technology. The change is about delivery mechanism, not content.

**Q: What happens to the steering-packages spec?**  
A: Retained for historical reference with DEPRECATED.md explaining the decision.

## Conclusion

This update clarifies the project scope and removes confusion about future .NET libraries. The VS Code Extension is the sole focus, providing a better user experience and broader applicability across languages and frameworks.

All documentation now accurately reflects this scope, and the project structure supports extension development exclusively.
