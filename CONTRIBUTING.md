# Contributing to Pragmatic Rhino SUIT

Thank you for your interest in contributing to Pragmatic Rhino SUIT (Standards-Unified Integration Toolkit)! This document provides guidelines and instructions for contributing.

**SUIT Up. Standardize. Ship It.**

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/pliekhus77/pr-suit-for-kiro/issues) to avoid duplicates
2. Gather information about the bug (steps to reproduce, expected vs actual behavior, screenshots)

When creating a bug report, include:
- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment** (VS Code version, OS, extension version)
- **Error messages** from VS Code output panel

### Suggesting Features

Feature requests are welcome! When suggesting a feature:
1. Check if it's already been suggested
2. Explain the problem you're trying to solve
3. Describe your proposed solution
4. Consider alternative solutions
5. Explain why this would be useful to most users

### Contributing Code

#### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/pr-suit-for-kiro.git
   cd pr-suit-for-kiro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the coding standards (see below)
   - Write tests for new functionality
   - Update documentation as needed

5. **Run tests**
   ```bash
   npm test
   npm run test:integration
   ```

6. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all tests pass
   - Wait for review

#### Coding Standards

**TypeScript:**
- Use TypeScript strict mode
- Provide explicit types for function parameters and return values
- Use `const` over `let`, avoid `var`
- Use async/await over raw Promises
- Follow ESLint rules

**Naming Conventions:**
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Interfaces: `PascalCase` (no `I` prefix)
- Functions/Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

**File Organization:**
```
src/
  commands/          # Command implementations
  providers/         # Tree views, code lens, diagnostics
  services/          # Business logic
  models/            # Data structures
  utils/             # Helpers
  __tests__/         # Tests (co-located with source)
```

**Testing:**
- Write unit tests for all new functionality
- Use Jest for unit tests
- Use VS Code Extension Test Runner for integration tests
- Aim for 80%+ code coverage
- Use AAA pattern (Arrange, Act, Assert)
- Test naming: `MethodName_Scenario_ExpectedBehavior`

**Documentation:**
- Add JSDoc comments for all public APIs
- Update README.md for user-facing changes
- Update CHANGELOG.md following Keep a Changelog format
- Add inline comments for complex logic

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(framework): add support for custom framework categories

fix(validation): correct regex for section heading detection

docs(readme): add troubleshooting section

test(framework-manager): add tests for update detection
```

### Contributing Frameworks

To add a new framework strategy:

1. **Create the framework markdown file**
   - Location: `frameworks/{framework-name}.md`
   - Follow the standard structure (Purpose, Key Concepts, Best Practices, Anti-Patterns, Summary)
   - Include front-matter with metadata

2. **Add to framework manifest**
   - Update `resources/frameworks/manifest.json`
   - Include id, name, description, category, version, fileName

3. **Create steering template**
   - Add corresponding file to `resources/frameworks/`
   - Name it `strategy-{framework}.md`
   - Ensure it follows steering document standards

4. **Create tests**
   - Add unit tests for framework loading
   - Add integration tests for installation

5. **Update documentation**
   - Add framework to README.md
   - Update CHANGELOG.md

6. **Submit Pull Request**
   - Explain why this framework is valuable
   - Provide examples of how it guides Kiro
   - Include any reference documentation

### Contributing Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add examples and use cases
- Improve code comments
- Create tutorials or guides
- Add screenshots or GIFs

### Review Process

1. **Automated Checks**
   - All tests must pass
   - Code coverage must meet threshold
   - ESLint must pass with no errors

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Keep discussions focused and respectful

3. **Merge**
   - Squash commits before merging
   - Update CHANGELOG.md
   - Tag release if applicable

## Development Workflow

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the development host
4. Check VS Code output panel for errors

### Debugging

1. Set breakpoints in TypeScript files
2. Press `F5` to start debugging
3. Use Debug Console for evaluation
4. Check VS Code Developer Tools (Help > Toggle Developer Tools)

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run with coverage
npm test -- --coverage
```

### Building

```bash
# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package for production
npm run package

# Create VSIX package
vsce package
```

## Project Structure

```
pr-suit-for-kiro/
├── .kiro/                    # Kiro configuration
│   ├── steering/             # Steering documents
│   └── specs/                # Feature specs
├── frameworks/               # Framework reference docs
├── resources/                # Extension resources
│   ├── frameworks/           # Framework templates
│   │   └── manifest.json     # Framework catalog
│   └── schemas/              # Validation schemas
├── src/                      # Source code
│   ├── commands/             # Command implementations
│   ├── providers/            # Tree views, code lens
│   ├── services/             # Business logic
│   ├── models/               # Data structures
│   ├── utils/                # Helpers
│   ├── __tests__/            # Tests
│   └── extension.ts          # Entry point
├── docs/                     # Documentation
├── build/                    # Build scripts
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
├── jest.config.js            # Jest config
├── README.md                 # User documentation
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # This file
└── LICENSE                   # MIT License
```

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/pliekhus77/pr-suit-for-kiro/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/pliekhus77/pr-suit-for-kiro/issues)
- **Chat**: Join our [Discord server](https://discord.gg/pragmaticrhino) (coming soon)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section
- GitHub contributors page

Thank you for contributing to Pragmatic Rhino SUIT! 🎉
