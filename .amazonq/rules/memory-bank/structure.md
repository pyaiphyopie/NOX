# NOX Platform - Project Structure

## Directory Organization

```
NOX/
├── .amazonq/                    # Amazon Q configuration and rules
│   └── rules/
│       └── memory-bank/         # Memory bank documentation
├── .github/                     # GitHub workflows and CI/CD
│   └── workflows/
│       ├── ci.yml              # Continuous integration
│       ├── deploy.yml          # Deployment pipeline
│       ├── security-scan.yml   # Security scanning
│       └── web-ci.yml          # Web-specific CI
├── .trunk/                     # Trunk-based development tools
├── flutter_blueprint/          # Flutter mobile application
│   ├── lib/                    # Dart source code
│   │   ├── src/               # Core application source
│   │   │   ├── core/         # Core utilities and configuration
│   │   │   ├── features/     # Feature modules
│   │   │   │   ├── auth/     # Authentication
│   │   │   │   ├── home/     # Home screen and discovery
│   │   │   │   ├── inbox/    # Messaging and notifications
│   │   │   │   ├── profile/  # User profiles
│   │   │   │   ├── pulse/    # Activity feed
│   │   │   │   ├── settings/ # App settings
│   │   │   │   └── tickets/  # Ticket management
│   │   │   └── shared/       # Shared components and themes
│   │   └── main.dart         # Application entry point
│   ├── packages/              # Monorepo packages
│   │   ├── app/              # Main application package
│   │   ├── core/             # Core utilities package
│   │   ├── features/         # Features package
│   │   └── shared/           # Shared components package
│   ├── test/                 # Test files
│   └── web/                  # Web-specific assets
├── src/                       # React web application
│   ├── components/           # Reusable UI components
│   │   ├── EventCard.jsx    # Event display component
│   │   ├── Footer.jsx       # Page footer
│   │   ├── Navbar.jsx       # Navigation bar
│   │   └── Notification.jsx # Notification component
│   ├── data/                # Static data and mockups
│   │   └── events.js        # Event data
│   ├── pages/               # Page components
│   │   ├── DiscoverPage.jsx # Event discovery page
│   │   ├── EventDetailPage.jsx # Event details page
│   │   ├── ProfilePage.jsx  # User profile page
│   │   ├── PromotersPage.jsx # Promoter dashboard
│   │   ├── TicketsPage.jsx  # Ticket management page
│   │   └── VenuesPage.jsx   # Venue listing page
│   ├── App.jsx              # Main application component
│   ├── App.test.jsx         # Application tests
│   ├── index.css            # Global styles
│   └── main.jsx             # Application entry point
└── test/                     # Additional test files
```

## Core Components and Relationships

### Web Application (React/Vite)
- **Entry Point**: `src/main.jsx` → `src/App.jsx`
- **Routing**: React Router DOM for page navigation
- **Styling**: Tailwind CSS with PostCSS processing
- **Testing**: Vitest with React Testing Library
- **Build Tool**: Vite for development and production builds

### Flutter Mobile Application
- **Architecture**: Monorepo with Melos package management
- **Package Structure**: 
  - `app/`: Main application entry point
  - `core/`: Shared utilities and configuration
  - `features/`: Feature-specific implementations
  - `shared/`: UI components and themes
- **State Management**: Provider pattern with repository layer
- **Testing**: Dart test framework with widget tests

### Shared Infrastructure
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Code Quality**: ESLint, Prettier, and Trunk for code standards
- **Security**: Automated security scanning in CI pipeline
- **Documentation**: Comprehensive documentation in markdown files

## Architectural Patterns

### Feature-Based Organization
Both web and mobile applications follow a feature-based organization pattern:
- Each feature is self-contained with its own UI, logic, and data
- Shared components and utilities are extracted to common packages
- Clear separation between presentation and business logic

### Repository Pattern (Flutter)
The Flutter application uses the repository pattern for data access:
- `*_repository.dart` files handle data operations
- Separation between data sources and business logic
- Consistent API for data access across features

### Component-Based Architecture (React)
The web application uses a component-based architecture:
- Reusable UI components in `src/components/`
- Page components in `src/pages/` for route handling
- Props-based data flow between components
- CSS-in-JS with Tailwind for styling

### Monorepo Management
The Flutter blueprint uses Melos for monorepo management:
- Shared dependencies across packages
- Consistent versioning and publishing
- Unified build and test commands
- Package isolation with shared utilities

## Build and Development Workflows

### Web Development
```
npm run dev      # Start development server
npm run build    # Create production build
npm run test     # Run tests
npm run lint     # Check code quality
npm run format   # Format code
```

### Flutter Development
```
melos bootstrap  # Setup monorepo dependencies
melos run test   # Run tests across all packages
flutter run      # Run mobile application
```

### CI/CD Pipeline
1. **Code Quality**: ESLint, Prettier, and Dart analysis
2. **Testing**: Unit tests, widget tests, and integration tests
3. **Security**: Automated vulnerability scanning
4. **Build**: Production builds for web and mobile
5. **Deployment**: Automated deployment to hosting platforms