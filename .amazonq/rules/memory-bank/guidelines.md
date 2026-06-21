# NOX Platform - Development Guidelines

## Code Quality Standards Analysis

### Configuration File Patterns (5/5 files exhibit these patterns)

**ES Module Syntax**: All configuration files use ES module syntax with `export default`
```javascript
export default {
  // configuration object
};
```

**Minimal Configuration**: Configuration files follow a minimal, declarative approach with only essential settings
```javascript
export default {
  plugins: [react()],  // Simple plugin array
};
```

**Environment Awareness**: Configuration adapts based on environment variables
```javascript
reporters: process.env.CI
  ? ['default', 'junit']
  : ['default'],
```

**Comment Organization**: Well-structured comments for configuration sections
```javascript
// ── Coverage ──────────────────────────────────
coverage: {
  // coverage settings
},
```

### Import/Export Patterns

**Named Imports for Dependencies**: Consistent use of named imports for framework dependencies
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
```

**Relative Imports for Local Files**: Clear distinction between package and local imports
```javascript
import App from './App';        // Local file
import './index.css';           // Local CSS
```

## Structural Conventions

### File Organization Standards

**Configuration File Structure**:
- Single default export per configuration file
- Object literal configuration with nested properties
- Alphabetical or logical grouping of configuration options
- Environment-specific conditional configurations

**Entry Point Patterns**:
- `main.jsx` as web application entry point
- `main.dart` as Flutter application entry point  
- Strict mode wrapper for React applications
- CSS import before component rendering

### Naming Conventions

**File Naming**:
- Configuration files: `*.config.js` pattern
- Test files: `*.test.jsx` or `*_test.dart` pattern
- Component files: PascalCase for React components (`Component.jsx`)
- Utility files: camelCase for helper functions

**Variable Naming**:
- Descriptive names for configuration objects
- camelCase for local variables and functions
- UPPER_CASE for environment variables

## Textual Standards and Documentation

### Commenting Patterns

**Section Headers**: Visual separation with em dash lines for configuration sections
```javascript
// ── Coverage ──────────────────────────────────
```

**Inline Comments**: Brief explanations for non-obvious configuration options
```javascript
exclude: [
  'src/main.jsx',           // entry point — tested via integration
],
```

**Configuration Documentation**: Comments explaining the purpose of configuration blocks
```javascript
// Coverage configuration with thresholds
coverage: {
  // settings...
},
```

### Code Documentation

**Self-Documenting Code**: Configuration uses descriptive property names that indicate purpose
```javascript
environment: 'jsdom',        // Clearly indicates test environment
extensions: ['jsx'],         // File extensions for testing
globals: true,              // Global test variables
```

**Threshold Documentation**: Numerical thresholds with clear meaning
```javascript
thresholds: {
  statements: 70,    // 70% statement coverage required
  branches: 60,      // 60% branch coverage required
  functions: 65,     // 65% function coverage required
  lines: 70,         // 70% line coverage required
},
```

## Practices Followed Throughout Codebase

### Modern JavaScript/JSX Practices

**React Strict Mode**: Always wrapping applications in React.StrictMode for development checks
```jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

**Functional Components**: Use of functional components with modern React patterns
```jsx
const App = () => {
  return <div>Content</div>;
};
```

**CSS-in-JS Approach**: Tailwind CSS with utility classes rather than separate CSS files

### Build and Tool Configuration

**Plugin-Based Architecture**: Extensible configuration through plugin arrays
```javascript
plugins: {
  tailwindcss: {},
  autoprefixer: {},
},
```

**Environment Detection**: CI/CD environment awareness in test configuration
```javascript
reporters: process.env.CI
  ? ['default', 'junit']
  : ['default'],
```

**Output Management**: Structured output directories for test results and coverage
```javascript
reportsDirectory: './coverage',
outputFile: process.env.CI
  ? { junit: './test-results/junit.xml' }
  : undefined,
```

### Testing Standards

**Comprehensive Coverage**: Detailed coverage configuration with thresholds
- Statement coverage: 70%
- Branch coverage: 60% 
- Function coverage: 65%
- Line coverage: 70%

**Test Environment**: jsdom for browser-like testing environment
```javascript
environment: 'jsdom',
```

**File Inclusion/Exclusion**: Clear patterns for test file management
```javascript
include: ['src/**/*.{js,jsx}'],
exclude: [
  'src/main.jsx',           // entry point
  'src/**/*.test.{js,jsx}', // test files themselves
],
```

## Semantic Patterns Overview

### Recurring Implementation Patterns

**Configuration Object Pattern**: Consistent use of configuration objects with nested properties
```javascript
export default {
  property: {
    nested: 'value',
    array: ['item1', 'item2'],
  },
};
```

**Plugin Chain Pattern**: Sequential plugin processing in build tools
```javascript
plugins: [react()],  // React plugin for Vite
```

**Conditional Configuration Pattern**: Environment-based configuration adaptation
```javascript
settings: process.env.CI ? ciSettings : devSettings,
```

### Common Architectural Approaches

**Separation of Concerns**: Clear separation between:
- Configuration (build, test, styling)
- Application code (components, pages)
- Testing code (test files)

**Minimal Configuration**: Only essential configuration with sensible defaults
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Progressive Enhancement**: Basic configuration with extension points
```javascript
theme: {
  extend: {},  // Empty extension ready for customization
},
```

### Frequently Used Code Idioms

**Default Export Pattern**: Single default export per configuration file
```javascript
export default configObject;
```

**Import Destructuring**: Destructuring imports for cleaner code
```javascript
import { defineConfig } from 'vite';
```

**Array Configuration**: Use of arrays for plugin and extension configuration
```javascript
plugins: [react()],
extensions: ['jsx'],
```

### Popular Annotations and Patterns

**Visual Separation**: Em dash lines for section headers in configuration
```javascript
// ── Section Name ──────────────────────────────
```

**Threshold Annotations**: Numerical thresholds with percentage indicators
```javascript
statements: 70,    // Percentage-based threshold
```

**Environment Annotations**: Comments explaining environment-specific behavior
```javascript
// CI-specific configuration
reporters: process.env.CI
  ? ['default', 'junit']
  : ['default'],
```

## Development Workflow Patterns

### Configuration Management

**Layered Configuration**: Base configuration with environment overrides
**Plugin Composition**: Building functionality through plugin composition
**Threshold Enforcement**: Code quality enforcement through coverage thresholds

### Testing Strategy

**Comprehensive Coverage**: Multi-faceted coverage reporting (text, JSON, HTML, LCOV)
**CI Integration**: JUnit reporting for CI/CD pipeline integration
**Exclusion Patterns**: Smart exclusion of entry points and test files from coverage

### Build Optimization

**Minimal Configuration**: Only essential configuration for faster builds
**Plugin Optimization**: Only necessary plugins included
**Path Patterns**: Glob patterns for file inclusion/exclusion

## Code Quality Enforcement

### Automated Quality Gates

**Coverage Thresholds**: Minimum coverage requirements enforced in CI
```javascript
thresholds: {
  statements: 70,
  branches: 60,
  functions: 65,
  lines: 70,
},
```

**Linting Integration**: ESLint integrated into development workflow
**Formatting Standards**: Prettier configuration for consistent code style
**Security Scanning**: npm audit integrated into CI pipeline

### Development Environment

**Hot Reloading**: Vite development server with HMR
**Test Watching**: Vitest watch mode for development
**Environment Detection**: Automatic adaptation to CI vs local development

These patterns represent the established development standards for the NOX platform, ensuring consistency, maintainability, and quality across both web and mobile codebases.