# API Overview

The Zoo Management System provides a comprehensive RESTful API for managing zoo operations.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens).

### Getting a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout user

### Animals

- `GET /api/animals` - Get all animals (with pagination)
- `GET /api/animals/:id` - Get animal by ID
- `POST /api/animals` - Create new animal
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal
- `GET /api/animals/stats` - Get animal statistics
- `GET /api/animals/search` - Search animals
- `POST /api/animals/:id/medical` - Add medical record
- `POST /api/animals/:id/feeding` - Add feeding record

### Visitors

- `GET /api/visitors` - Get all visitors (with pagination)
- `GET /api/visitors/:id` - Get visitor by ID
- `POST /api/visitors` - Register new visitor
- `PUT /api/visitors/:id` - Update visitor
- `DELETE /api/visitors/:id` - Delete visitor
- `GET /api/visitors/stats` - Get visitor statistics
- `GET /api/visitors/search` - Search visitors
- `POST /api/visitors/:id/tickets` - Purchase ticket
- `POST /api/visitors/:id/visits` - Record visit
- `POST /api/visitors/:id/loyalty-points` - Add loyalty points

### Exhibits

- `GET /api/exhibits` - Get all exhibits (with pagination)
- `GET /api/exhibits/:id` - Get exhibit by ID
- `POST /api/exhibits` - Create new exhibit
- `PUT /api/exhibits/:id` - Update exhibit
- `DELETE /api/exhibits/:id` - Delete exhibit
- `GET /api/exhibits/stats` - Get exhibit statistics
- `GET /api/exhibits/search` - Search exhibits
- `POST /api/exhibits/:id/maintenance` - Add maintenance record
- `PUT /api/exhibits/:id/environmental` - Update environmental controls
- `POST /api/exhibits/:id/staff` - Assign staff to exhibit

### Staff

- `GET /api/staff` - Get all staff (with pagination)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `GET /api/staff/stats` - Get staff statistics
- `GET /api/staff/search` - Search staff
- `POST /api/staff/:id/training` - Add training record
- `POST /api/staff/:id/review` - Add performance review

### Tickets

- `GET /api/tickets` - Get all tickets (with pagination)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Purchase ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/tickets/stats` - Get ticket statistics
- `POST /api/tickets/validate/:ticketId` - Validate and use ticket
- `GET /api/tickets/today` - Get today's tickets

### Feeding

- `GET /api/feedings` - Get all feeding schedules (with pagination)
- `GET /api/feedings/:id` - Get feeding by ID
- `POST /api/feedings` - Create feeding schedule
- `PUT /api/feedings/:id` - Update feeding schedule
- `DELETE /api/feedings/:id` - Delete feeding schedule
- `POST /api/feedings/:id/complete` - Mark feeding as completed
- `GET /api/feedings/pending` - Get pending feedings
- `GET /api/feedings/today` - Get today's feedings
- `GET /api/feedings/stats` - Get feeding statistics

### Health Records

- `GET /api/health-records` - Get all health records (with pagination)
- `GET /api/health-records/:id` - Get health record by ID
- `POST /api/health-records` - Create health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record
- `GET /api/health-records/stats` - Get health statistics
- `GET /api/health-records/due` - Get animals due for health check
- `GET /api/health-records/animal/:animalId` - Get records by animal

### Reports

- `GET /api/reports` - Get all reports (with pagination)
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports/animal-health` - Generate animal health report
- `POST /api/reports/visitor-analytics` - Generate visitor analytics report
- `POST /api/reports/financial` - Generate financial report
- `POST /api/reports/exhibit-occupancy` - Generate exhibit occupancy report
- `DELETE /api/reports/:id` - Delete report

## Pagination

Most list endpoints support pagination:

```
GET /api/animals?page=1&limit=10
```

Response format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Filtering

Many endpoints support filtering:

```
GET /api/animals?species=lion&status=active
GET /api/visitors?isVip=true&membershipType=premium
GET /api/tickets?type=adult&isUsed=false
```

## Sorting

Sort results using `sortBy` and `sortOrder`:

```
GET /api/animals?sortBy=name&sortOrder=asc
GET /api/visitors?sortBy=totalSpent&sortOrder=desc
```

## Searching

Search endpoints use a query parameter:

```
GET /api/animals/search?q=lion
GET /api/visitors/search?q=john
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email",
      "value": "invalid-email"
    }
  ]
}
```

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Best Practices

1. Always handle errors properly
2. Use pagination for large datasets
3. Include authentication token in all protected requests
4. Validate data before sending to API
5. Use appropriate HTTP methods
6. Cache responses when possible
7. Handle rate limiting gracefully

## Examples

### Complete Animal Creation Flow

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@zoo.com',
    password: 'admin123'
  })
});
const { token } = await loginResponse.json();

// 2. Get exhibits
const exhibitsResponse = await fetch('/api/exhibits', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: exhibits } = await exhibitsResponse.json();

// 3. Create animal
const animalResponse = await fetch('/api/animals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Simba',
    species: 'Panthera leo',
    gender: 'male',
    birthDate: '2018-03-15',
    exhibitId: exhibits[0]._id,
    diet: { primary: 'meat', feedingFrequency: 'daily' }
  })
});
const animal = await animalResponse.json();
```
