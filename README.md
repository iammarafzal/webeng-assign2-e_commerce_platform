# E-Commerce Platform - User Registration Service

A backend API for user registration with integration testing and CI/CD using GitHub Actions.

## Features

- **User Registration API** (`POST /users`) - Register new users with email validation
- **PostgreSQL Database** - Persistent data storage with TypeORM
- **Integration Tests** - Comprehensive test suite using Jest and Supertest
- **GitHub Actions CI** - Automated testing on every push

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webeng-assign2-e_commerce_platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your PostgreSQL database connection in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce
```

## Database Setup

Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE ecommerce;
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode
```bash
npm start
```

## API Endpoints

### Register a New User
**POST** `/users`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Health Check
**GET** `/health`

Response (200 OK):
```json
{
  "status": "ok"
}
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
Tests are configured to:
- ✅ Use real PostgreSQL database (no mocking)
- ✅ Create test users and verify database persistence
- ✅ Clean up test data after execution
- ✅ Test email validation
- ✅ Test duplicate email prevention
- ✅ Test concurrent user registration
- ✅ Verify UUID generation for user IDs

## GitHub Actions CI/CD

The project includes automated testing via GitHub Actions:

1. **Trigger**: Runs on every push to `main` and `develop` branches
2. **Setup**: 
   - Checks out code
   - Sets up Node.js 18
   - Starts PostgreSQL service
3. **Steps**:
   - Installs dependencies with `npm install`
   - Runs tests with `npm test`
4. **Artifacts**: Test results are uploaded for review

### Workflow Status Badge
[![Integration Tests](https://github.com/<your-username>/webeng-assign2-e_commerce_platform/actions/workflows/test.yml/badge.svg)](https://github.com/<your-username>/webeng-assign2-e_commerce_platform/actions)

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions workflow
├── src/
│   ├── config/
│   │   └── data-source.js        # Database configuration
│   ├── models/
│   │   └── User.js               # User schema/model
│   ├── app.js                    # Express app setup
│   └── index.js                  # Server entry point
├── tests/
│   └── users.integration.test.js # Integration tests
├── package.json                  # Dependencies & scripts
├── jest.config.js               # Jest configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Key Implementation Details

### User Registration (POST /users)
- **Validation**: Email format and required fields
- **Duplicate Check**: Prevents duplicate email registrations
- **Database Storage**: Persists user data with UUID
- **Response**: Returns user object with metadata

### Database Schema (PostgreSQL)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  firstName VARCHAR,
  lastName VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Test Suite
- **8 Integration Tests** covering:
  - Successful user registration
  - Validation (email, password)
  - Duplicate prevention
  - Database persistence
  - Concurrent registrations
  - Unique ID generation

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check that the database exists

### Tests Timing Out
- Ensure PostgreSQL is fully initialized
- Increase test timeout in `jest.config.js` if needed
- Check database logs for issues

### Port Already in Use
- Change `PORT` in `.env` to an available port
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## Notes

- Passwords are stored as plain text for development only. Use bcrypt or similar in production.
- Email validation is basic. Consider using a validation library in production.
- TypeORM synchronize is enabled for development. Disable in production and use migrations.

## License

ISC