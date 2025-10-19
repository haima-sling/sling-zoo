# Contributing to Zoo Management System

Thank you for your interest in contributing to the Zoo Management System! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** if you're adding functionality
5. **Ensure tests pass**: `npm test`
6. **Run the linter**: `npm run lint`
7. **Commit your changes** using clear, descriptive messages
8. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- **One feature per PR**: Keep pull requests focused on a single feature or bug fix
- **Update documentation**: Include relevant documentation updates
- **Add tests**: Ensure adequate test coverage
- **Follow code style**: Run `npm run format` before committing
- **Write clear commit messages**: Use the present tense ("Add feature" not "Added feature")

## Development Setup

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Redis 6+ (optional)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/zoo-management.git
cd zoo-management

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/animal.test.js
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format
```

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- Use `const` for constants, `let` for variables
- Use template literals for string interpolation
- Use arrow functions for anonymous functions
- Use async/await instead of callbacks
- Keep functions small and focused
- Write descriptive variable and function names
- Add comments for complex logic

### File Organization

- Place models in `src/models/`
- Place controllers in `src/controllers/`
- Place services in `src/services/`
- Place utilities in `src/utils/`
- Place tests in `tests/`

### Naming Conventions

- **Files**: Use camelCase for file names (e.g., `animalController.js`)
- **Classes**: Use PascalCase (e.g., `Animal`, `DatabaseConfig`)
- **Functions**: Use camelCase (e.g., `getAllAnimals`, `createTicket`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `USER_ROLES`, `HTTP_STATUS`)
- **Variables**: Use camelCase (e.g., `animalData`, `visitorCount`)

### Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms
- Update README.md when adding features
- Keep API documentation up to date

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Example:
```
Add feeding schedule management

- Implement feeding schedule CRUD operations
- Add validation for feeding times
- Create tests for feeding controller

Fixes #123
```

## Testing Guidelines

- Write unit tests for all new functions
- Write integration tests for API endpoints
- Maintain test coverage above 70%
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

Example:
```javascript
describe('Animal Controller', () => {
  describe('createAnimal', () => {
    it('should create a new animal with valid data', async () => {
      // Arrange
      const animalData = { /* ... */ };
      
      // Act
      const response = await request(app)
        .post('/api/animals')
        .send(animalData);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(animalData.name);
    });
  });
});
```

## Review Process

1. **Automated checks**: All tests and linting must pass
2. **Code review**: At least one maintainer must approve
3. **Documentation**: Ensure documentation is updated
4. **Testing**: Verify test coverage is adequate

## Getting Help

- Check the [documentation](docs/)
- Search existing issues
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to the Zoo Management System!
