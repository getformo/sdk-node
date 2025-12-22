# Contributing to Formo Node SDK

Thank you for your interest in contributing to the Formo Node SDK! This guide will help you get started.

## Table of Contents

- [Project Structure](#project-structure)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Stainless SDK Generation](#stainless-sdk-generation)
- [Making Changes](#making-changes)
- [Running Tests](#running-tests)
- [Code Style](#code-style)

## Project Structure

```
sdk-node/
├── src/                              # Main SDK source code (manually maintained)
│   ├── FormoAnalytics.ts             # Main SDK class
│   ├── queue/                        # Event batching and retry logic
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Utilities (address checksumming, etc.)
│   └── validators/                   # Input validation
├── sdks/
│   └── sdk-server-side-typescript/   # Generated API client (via Stainless)
├── openapi.json                      # OpenAPI specification for the Formo API
├── .stainless/                       # Stainless configuration
│   ├── stainless.yml                 # Stainless SDK configuration
│   └── workspace.json                # Stainless workspace settings
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

## Stainless SDK Generation

This project uses [Stainless](https://www.stainless.com/) to generate type-safe API clients from our OpenAPI specification. The generated code lives in `sdks/sdk-server-side-typescript/`.

### Initial Setup

If you need to set up Stainless for the first time:

1. **Install the Stainless CLI:**

   ```bash
   npm install -g stainless
   ```

2. **Initialize Stainless in your project:**

   ```bash
   stl init
   ```

   During initialization, you'll be prompted to:

   - Select your OpenAPI specification file (`openapi.json`)
   - Choose the target language(s) (TypeScript for this project)
   - Configure output directories

3. **Configuration files:**

   The `.stainless/` directory is included in the repository and contains:

   - `stainless.yml` - Main configuration file for SDK generation
   - `workspace.json` - Workspace settings

   Commit any changes to these files to ensure all contributors stay in sync.

### Regenerating the SDK

When the OpenAPI specification (`openapi.json`) is updated, you need to regenerate the SDK:

```bash
stainless generate
```

This will regenerate the files in `sdks/sdk-server-side-typescript/` based on the current OpenAPI spec.

### Modifying Generated Code

> **Important:** Most of the code in `sdks/sdk-server-side-typescript/` is auto-generated.

- Modifications to generated files may persist between generations but could result in merge conflicts.
- The generator will **never** modify the contents of `src/lib/` and `examples/` directories within the generated SDK.
- For custom logic, prefer adding code to the main `src/` directory rather than modifying generated files.

### Updating the OpenAPI Specification

When making API changes:

1. Update `openapi.json` with the new endpoints, schemas, or modifications
2. Run `stainless generate` to regenerate the SDK
3. Test the changes thoroughly
4. Commit both the `openapi.json` changes and the regenerated SDK files

## Making Changes

### Main SDK Code (`src/`)

The core SDK logic in `src/` is manually maintained:

- `FormoAnalytics.ts` - Main entry point and public API
- `queue/` - Event batching, retry logic, and graceful shutdown
- `types/` - TypeScript interfaces and type definitions
- `utils/` - Helper functions for address checksumming, property normalization
- `validators/` - Input validation logic

When making changes:

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `pnpm test`
4. Submit a pull request

### Generated SDK Code (`sdks/`)

For changes to the generated API client:

1. Update `openapi.json` with the required changes
2. Regenerate the SDK: `stainless generate`
3. Test the changes
4. Commit both files

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run integration tests (requires API key)
FORMO_WRITE_KEY=your-key pnpm run test:integration
```

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
