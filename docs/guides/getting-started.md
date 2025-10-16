# Getting Started with Zoo Management System

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher) - optional, for caching
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/zoo-management/zoo-system.git
cd zoo-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zoo_management
JWT_SECRET=your_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_password
REDIS_URL=redis://localhost:6379
```

### 4. Set Up the Database

Run migrations to set up the database schema:

```bash
npm run migrate
```

Seed the database with sample data:

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The server should now be running at `http://localhost:3000`

## Quick Tour

### 1. Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Save the returned token for authenticated requests.

### 4. Create an Exhibit

```bash
curl -X POST http://localhost:3000/api/exhibits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "African Savanna",
    "type": "outdoor",
    "theme": "african_savanna",
    "description": "Large outdoor exhibit",
    "capacity": {"visitors": 150, "animals": 12},
    "size": {"length": 100, "width": 80, "height": 15, "area": 8000},
    "operatingHours": {
      "open": "09:00",
      "close": "17:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    },
    "admissionFee": {"adult": 25, "child": 15, "senior": 20, "group": 20}
  }'
```

### 5. Add an Animal

```bash
curl -X POST http://localhost:3000/api/animals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Simba",
    "species": "Panthera leo",
    "gender": "male",
    "birthDate": "2018-03-15",
    "arrivalDate": "2018-06-01",
    "origin": "captive_bred",
    "exhibitId": "EXHIBIT_ID",
    "diet": {
      "primary": "meat",
      "feedingFrequency": "daily"
    }
  }'
```

## Common Tasks

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/animal.test.js
```

### Code Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

## Project Structure

```
zoo-system/
├── src/
│   ├── app.js              # Express app setup
│   ├── components/         # Routes
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   └── config/             # Configuration files
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── scripts/                # Utility scripts
├── config/                 # Environment configs
├── docs/                   # Documentation
└── package.json
```

## Next Steps

- Read the [API Documentation](../api/README.md)
- Learn about [Authentication](./authentication.md)
- Explore [Data Models](./models.md)
- Check out [Best Practices](./best-practices.md)

## Troubleshooting

### MongoDB Connection Issues

If you can't connect to MongoDB:

1. Ensure MongoDB is running: `sudo systemctl status mongod`
2. Check the connection string in `.env`
3. Verify MongoDB port is not blocked

### Port Already in Use

If port 3000 is already in use:

```bash
# Change port in .env
PORT=3001
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## Getting Help

- Check the [FAQ](./faq.md)
- Read the [API Documentation](../api/README.md)
- Open an issue on GitHub
- Contact support@zoo-management.com
