# Zoo Management System

A comprehensive zoo management system built with Node.js, Express, and MongoDB. This system provides complete functionality for managing animals, visitors, staff, facilities, and daily operations at a modern zoo.

## Features

### Animal Management
- Complete animal profiles with medical records
- Feeding schedules and dietary requirements
- Breeding programs and genetic tracking
- Health monitoring and veterinary care
- Habitat management and environmental controls

### Visitor Management
- Ticket sales and pricing management
- Visitor tracking and analytics
- Group bookings and special events
- Membership programs and loyalty rewards
- Queue management for popular exhibits

### Staff Management
- Employee profiles and scheduling
- Role-based access control
- Training records and certifications
- Performance tracking and evaluations
- Communication and notification systems

### Facility Management
- Exhibit monitoring and maintenance
- Security systems and access control
- Environmental monitoring (temperature, humidity, etc.)
- Equipment tracking and maintenance schedules
- Emergency response protocols

### Analytics & Reporting
- Visitor analytics and trends
- Animal health and behavior reports
- Financial reporting and budgeting
- Operational efficiency metrics
- Custom dashboard and visualizations

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **Caching**: Redis
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier
- **Build**: Webpack

## Installation

1. Clone the repository:
```bash
git clone https://github.com/zoo-management/zoo-system.git
cd zoo-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run migrate
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zoo_management
JWT_SECRET=your_jwt_secret_here
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
UPLOAD_PATH=./uploads
LOG_LEVEL=info
```

## API Documentation

The API documentation is available at `/docs` when the server is running. Key endpoints include:

- `GET /api/animals` - List all animals
- `POST /api/animals` - Create new animal
- `GET /api/visitors` - List visitors
- `POST /api/tickets` - Purchase tickets
- `GET /api/exhibits` - List exhibits
- `POST /api/feeding` - Log feeding activity

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@zoo-management.com or join our Slack channel.

## Roadmap

- [ ] Mobile app for staff
- [ ] IoT integration for environmental monitoring
- [ ] AI-powered animal behavior analysis
- [ ] Virtual reality exhibits
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
