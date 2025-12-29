# Contributing to Formo Node SDK

Thank you for your interest in contributing to the Formo Node SDK! This guide will help you get started.

## Table of Contents

- [Project Structure](#project-structure)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Making Changes](#making-changes)
- [Running Tests](#running-tests)
- [Code Style](#code-style)

## Project Structure

```
sdk-node/
├── src/                              # Main SDK source code
│   ├── FormoAnalytics.ts             # Main SDK class
│   ├── queue/                        # Event batching and retry logic
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Utilities (address checksumming, etc.)
│   └── validators/                   # Input validation
├── test/                             # Tests
│   ├── __tests__/                    # Integration tests
│   └── queue/                        # Unit tests for queue/events
├── scripts/                          # Utility and test scripts
└── package.json
```

## Setting Up the Development Environment

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd sdk-node
   ```

2. **Install dependencies:**

   This project uses [pnpm](https://pnpm.io/). Other package managers may work but are not officially supported.

   ```bash
   pnpm install
   ```

3. **Build the project:**

   ```bash
   pnpm build
   ```

## Making Changes

The core SDK logic in `src/` is manually maintained.

Key components:

- `FormoAnalytics.ts`: Main entry point and public API.
- `queue/`: Handles event buffering, batching, and retrying.
- `types/`: Use this for all shared interfaces and types.

When making changes:

1. Create a feature branch from `main`.
2. Make your changes with appropriate tests.
3. Ensure all unit tests pass: `npm test`.
4. If modifying API interactions, verify with integration tests (see below).
5. Submit a pull request.

## Running Tests

### Unit Tests

Run the full unit test suite:

```bash
npm test
```

Or just the queue/logic tests:

```bash
npm run test:queue
```

### Integration Tests

These tests make real network requests to the Formo API. You need a valid Write Key.

```bash
FORMO_WRITE_KEY=your-key npm run test:integration
```

### Manual Testing Script

To verify functionality with a real script in a separate environment:

1. Create a `.env` file with `FORMO_WRITE_KEY=your-key`
2. Run the manual test script:
   ```bash
   pnpm run script:test-analytics
   ```

### Testing Packaging

To simulate consuming the package as a real user:

1. Create a tarball:

   ```bash
   npm pack
   ```

   This creates a file like `formo-analytics-node-1.0.0.tgz`.

2. Install it in another project:

   ```bash
   npm install /path/to/sdk-node/formo-analytics-node-1.0.0.tgz
   ```

3. Verify usage works as expected.

## Code Style

This project uses:

- [Prettier](https://prettier.io/) for code formatting
- [ESLint](https://eslint.org/) for linting

```bash
# Check linting
pnpm lint

# Fix linting and formatting issues
pnpm fix
```

## Questions?

If you have questions or need help, please open an issue on GitHub.
