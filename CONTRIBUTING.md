# How to contribute

If you want to contribute or run a local version of the Formo Node SDK, follow these steps:

## Build the SDK Locally

Run the following command to build both CommonJS and ESM versions of the SDK:

```bash
pnpm install
pnpm build
pnpm test
```

## Testing Locally

### Link the Local Package

To test your SDK changes in a test app, you can link the package locally using `npm link` or `pnpm link`.

For example, if your projects are in the same directory:

```
~/
├── your-app/
└── sdk-node/
```

Run the following commands:

```bash
# In ~/your-app
pnpm link ../sdk-node
```

Or with npm:

```bash
# In ~/your-app
npm link ../sdk-node
```

### Apply Changes

Any changes you make to your local package require rebuilding to be reflected:

```bash
# In ~/sdk-node
pnpm build
```

The changes will automatically be available in the linked project.

### Unlink the Package

To remove the link:

```bash
# In ~/your-app
pnpm unlink ../sdk-node
```

Or with npm:

```bash
# In ~/your-app
npm unlink ../sdk-node
```

## Running Tests

Run the test suite:

```bash
pnpm test
```

### Integration Tests

These tests make real network requests to the Formo API. You need a valid Write Key:

```bash
FORMO_WRITE_KEY=your-key pnpm run test:integration
```

## Linting

Check code style and types:

```bash
pnpm lint
```

## Publishing

1. **Update the version** using npm:

   ```bash
   npm version patch  # For bug fixes
   npm version minor  # For new features
   npm version major  # For breaking changes
   ```

   This automatically:

   - Updates `package.json` with the new version
   - Creates a git commit with the change
   - Creates a version tag (e.g., `v1.0.1`)

2. **Push the commit and tag**:

   ```bash
   git push --follow-tags
   ```

3. **Automatic workflow execution**:
   - GitHub Actions workflow triggers on the `v*` tag
   - Builds and tests the package
   - Publishes to npm
