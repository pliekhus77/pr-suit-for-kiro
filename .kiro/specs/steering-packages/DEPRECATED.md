# DEPRECATED: Steering Packages Spec

**Status:** Deprecated  
**Date:** January 10, 2025  
**Reason:** Project scope changed to focus exclusively on VS Code Extension

## Background

This spec was originally created to design NuGet packages for distributing Kiro steering strategy files to .NET projects. The packages would use MSBuild and NuGet's content file mechanism to automatically copy markdown files to the `.kiro/steering/` directory.

## Why Deprecated

The project has pivoted to focus exclusively on the VS Code Extension as the primary delivery mechanism for framework guidance. The extension provides:

1. **Better User Experience**: Interactive browsing, installation, and updates
2. **Cross-Platform**: Works with any language/framework, not just .NET
3. **Richer Features**: Validation, previews, tree views, webviews
4. **Easier Maintenance**: Single codebase vs. multiple NuGet packages
5. **Faster Iteration**: No need to publish to NuGet.org for updates

## Migration Path

All functionality from this spec has been incorporated into the VS Code Extension:

- **Framework Installation**: `Browse Frameworks` command
- **Framework Updates**: `Update Framework` / `Update All Frameworks` commands
- **Framework Management**: Tree view in sidebar
- **Validation**: `Validate Steering Document` command
- **Customization**: `Create Custom Steering` command

## Related Specs

- **Active**: `.kiro/specs/framework-steering-management/` - VS Code Extension implementation
- **Active**: `.kiro/specs/c4-model-expansion/` - C4 diagram features

## Files in This Spec

- `requirements.md` - Original requirements (historical reference)
- `design.md` - NuGet package design (historical reference)
- `tasks.md` - Implementation tasks (not executed)
- `DEPRECATED.md` - This file

## Retention

This spec is retained for historical reference and to document the decision-making process. It may be removed in a future cleanup.

## Questions

If you have questions about this deprecation, please refer to:
- `.kiro/steering/product.md` - Updated product scope
- `.kiro/specs/framework-steering-management/` - Current implementation
