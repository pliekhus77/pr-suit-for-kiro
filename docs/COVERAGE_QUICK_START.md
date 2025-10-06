# Coverage Quick Start Guide

## TL;DR

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html

# Current status: 63.66% (Target: 80%)
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run test:coverage` | Run all tests with coverage |
| `npm run test:coverage:watch` | Watch mode with coverage |
| `npm run test:coverage:ci` | CI-optimized coverage run |
| `npm run coverage:check` | Check if coverage meets thresholds |

## Coverage Thresholds

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Statements | 63.66% | 80% | ❌ Below |
| Branches | 54.51% | 80% | ❌ Below |
| Functions | 68.1% | 80% | ❌ Below |
| Lines | 63.16% | 80% | ❌ Below |

## Where to Find Reports

- **HTML Report**: `coverage/index.html` (open in browser)
- **Console**: Printed after test run
- **LCOV**: `coverage/lcov.info` (for CI/CD)
- **JSON**: `coverage/coverage-final.json` (machine-readable)

## What's Covered

✅ **Well Covered (>80%)**
- `src/utils/file-system.ts` - 100%
- `src/services/steering-validator.ts` - 100%
- `src/services/template-engine.ts` - 100%
- `src/models/` - 100%

⚠️ **Needs Work (<80%)**
- `src/extension.ts` - 0% (not tested yet)
- `src/commands/steering-commands.ts` - 0%
- `src/commands/workspace-commands.ts` - 0%
- `src/commands/framework-commands.ts` - 81.35%

## How to Improve Coverage

1. **Write tests for uncovered files** (see list above)
2. **Focus on critical paths first** (framework installation, validation)
3. **Run coverage after adding tests**: `npm run test:coverage`
4. **Check the HTML report** to see what lines need coverage

## CI/CD Integration

Coverage is checked automatically:
- ✅ On every push to main/develop
- ✅ On every pull request
- ❌ Build fails if coverage < 80%

## Coverage Badges

Badges in README show:
- Real-time coverage from Coveralls
- Detailed analysis from Codecov
- Minimum threshold (80%)

## Need Help?

See full documentation: [docs/COVERAGE.md](./COVERAGE.md)

