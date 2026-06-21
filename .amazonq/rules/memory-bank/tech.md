# NOX Platform - Technology Stack

## Programming Languages and Versions

### Web Application (React)
- **JavaScript/JSX**: ECMAScript 2022+ with JSX syntax
- **Node.js**: Version 18+ (as indicated by package.json dependencies)
- **Package Manager**: npm (Node Package Manager)

### Mobile Application (Flutter)
- **Dart**: Version 3.3.0+ (Flutter 3.10.0+)
- **Flutter SDK**: Version 3.10.0 or higher
- **Package Manager**: pub (Dart's package manager)

## Build Systems and Development Tools

### Web Build System
- **Vite**: Modern frontend build tool (v8.0.14+)
- **Configuration**: `vite.config.js` for build settings
- **Development Server**: Hot module replacement (HMR)
- **Production Build**: Optimized bundling and minification

### Mobile Build System
- **Flutter CLI**: Official Flutter command-line tools
- **Melos**: Monorepo management tool (v2.6.0+)
- **Configuration**: `melos.yaml` for workspace management
- **Build Targets**: iOS, Android, and Web platforms

### Testing Frameworks
- **Web Testing**: Vitest (v4.1.7+) with React Testing Library
- **Mobile Testing**: Dart test framework with Flutter widget tests
- **Coverage**: @vitest/coverage-v8 for code coverage reporting
- **Test Environment**: jsdom for browser-like testing environment

### Styling and UI Frameworks
- **Tailwind CSS**: Utility-first CSS framework (v3.4.19+)
- **PostCSS**: CSS processing with autoprefixer (v10.5.0+)
- **Flutter Material**: Material Design components for Flutter
- **Custom Themes**: App-specific theme configurations in both platforms

## Dependencies and Package Management

### Web Dependencies (package.json)
**Core Runtime Dependencies:**
- `react`: ^19.2.6 - React library
- `react-dom`: ^19.2.6 - React DOM rendering
- `react-router-dom`: ^7.15.1 - Client-side routing

**Development Dependencies:**
- `@vitejs/plugin-react`: ^6.0.2 - Vite React plugin
- `tailwindcss`: ^3.4.19 - CSS framework
- `autoprefixer`: ^10.5.0 - CSS vendor prefixing
- `postcss`: ^8.5.15 - CSS processing
- `vitest`: ^4.1.7 - Testing framework
- `eslint`: ^8.57.1 - Code linting
- `prettier`: ^3.6.2 - Code formatting
- Testing libraries: @testing-library/react, @testing-library/jest-dom

### Flutter Dependencies (pubspec.yaml)
**Workspace Configuration:**
- `melos`: ^2.6.0 - Monorepo management
- `sdk`: '>=3.3.0 <4.0.0' - Dart SDK constraint
- `flutter`: '>=3.10.0' - Flutter SDK constraint

**Package Dependencies:**
- Each sub-package (`app/`, `core/`, `features/`, `shared/`) has its own `pubspec.yaml`
- Shared dependencies managed through workspace configuration
- Platform-specific dependencies for iOS and Android

## Development Commands and Workflows

### Web Development Commands
```bash
# Development
npm run dev              # Start development server
npm run preview          # Preview production build

# Building
npm run build           # Create production build

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without fixing
npm run audit           # Security audit

# Complete check
npm run check           # Format check + lint + test + build
```

### Flutter Development Commands
```bash
# Workspace setup
melos bootstrap         # Bootstrap all packages
melos clean             # Clean workspace

# Development
flutter run             # Run on connected device/emulator
flutter build           # Build for target platform

# Testing
melos run test          # Run tests across all packages
flutter test            # Run Flutter tests

# Code Quality
dart analyze            # Analyze Dart code
dart format .           # Format Dart code

# Package management
melos version           # Version packages
melos publish           # Publish packages
```

### CI/CD Commands
```bash
# GitHub Actions workflows
- ci.yml:              Full CI pipeline
- deploy.yml:          Deployment pipeline  
- security-scan.yml:   Security scanning
- web-ci.yml:          Web-specific CI

# Trunk-based development
trunk check            # Run all checks
trunk fmt              # Format code
trunk upgrade          # Upgrade tools
```

## Environment and Configuration

### Web Configuration Files
- `vite.config.js`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS processing configuration
- `vitest.config.js`: Vitest testing configuration
- `.eslintrc.cjs`: ESLint rules and configuration
- `.prettierrc`: Prettier formatting rules

### Flutter Configuration Files
- `melos.yaml`: Melos workspace configuration
- `analysis_options.yaml`: Dart analysis options
- `pubspec.yaml`: Root workspace manifest
- `flutter_launcher_icons.yaml`: App icon configuration
- `dart_test.yaml`: Dart test configuration

### Development Environment
- **IDE Support**: VS Code with Flutter and React extensions
- **Version Control**: Git with conventional commits
- **Code Quality**: Pre-commit hooks via Trunk
- **Documentation**: Markdown files throughout project
- **Asset Management**: Organized asset directories for icons and images

## Platform-Specific Considerations

### Web Platform
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive Design**: Mobile-first responsive layouts
- **Progressive Web App**: Potential for PWA capabilities
- **SEO Considerations**: Server-side rendering capabilities

### Mobile Platforms
- **iOS**: Minimum iOS version based on Flutter requirements
- **Android**: Minimum API level based on Flutter requirements
- **Platform Channels**: Native functionality integration
- **App Store Compliance**: Store-specific requirements

### Cross-Platform Considerations
- **Shared Business Logic**: Potential for code sharing between web and mobile
- **Consistent Design**: Material Design across platforms
- **API Integration**: Unified backend API consumption
- **State Management**: Similar patterns across platforms