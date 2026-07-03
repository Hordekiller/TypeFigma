# Contributing to TypeFigma

Thanks for your interest in contributing! We welcome contributions of all kinds: bug fixes, features, documentation, and testing.

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment or toxic behavior will not be tolerated.

## How to Contribute

### 1. Find or Create an Issue

- Check [open issues](https://github.com/Hordekiller/TypeFigma/issues) for something to work on
- If you're fixing a bug or adding a feature, create an issue first to discuss it

### 2. Set Up the Project

```bash
git clone https://github.com/Hordekiller/TypeFigma.git
cd TypeFigma
npm install
npm run build
```

### 3. Make Your Changes

- Follow the existing code style (TypeScript strict mode, NodeNext modules)
- Keep changes focused — one feature/fix per pull request
- Write or update tests

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Type-check all packages
npm run typecheck

# Run tests for a specific package
cd packages/core/theme-builder
npx vitest run
```

### 5. Submit a Pull Request

1. Fork the repository
2. Create a branch from `main`: `git checkout -b your-feature`
3. Commit your changes with a clear message
4. Push to your fork: `git push origin your-feature`
5. Open a pull request against `main`

## Development Guidelines

### Package Structure

Each package follows the same structure:
```
src/          # Source code
src/index.ts  # Public API exports
src/__tests__/ # Vitest test files
```

### Testing

- Use [Vitest](https://vitest.dev/) for testing
- Place tests in `src/__tests__/*.test.ts`
- Run tests with `npx vitest run` in the package directory
- We aim for 60%+ coverage on core packages

### TypeScript

- Strict mode is enabled across all packages
- Use `NodeNext` module resolution
- Prefer interfaces over types for public APIs
- Avoid `any` — use proper generics or `unknown`

### Commit Messages

Use clear, descriptive commit messages:

```
Area: Short description of change

Optional longer explanation of what and why.
```

Examples:
```
theme-builder: fix camelCase handling in slugify

font-manager: reorder weight detection for extrabold before bold
```

## Priority Areas

These are the most valuable areas to contribute:

| Area | Difficulty | Impact |
|------|-----------|--------|
| **Web UI** (Next.js) | Medium | High — makes the tool accessible to non-technical users |
| **WooCommerce templates** | Medium | High — cart, checkout, my-account need real-world testing |
| **End-to-end testing** | Hard | High — test with actual WordPress/Elementor |
| **Elementor Pro widgets** | Medium | Medium — slides, forms, price list templates |
| **CSS-in-JS / CSS Modules output** | Easy | Medium — additional output format options |
| **Documentation** | Easy | High — tutorials, GIF demos, API docs |

## Questions?

Open a [discussion](https://github.com/Hordekiller/TypeFigma/discussions) or ask in the issue tracker.
