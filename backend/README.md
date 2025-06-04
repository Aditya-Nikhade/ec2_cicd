# Chat Application Backend

This is the backend service for the chat application, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 4.4
- Redis >= 6.0

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/chatapp

   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # Session Configuration
   SESSION_SECRET=your-session-secret-key

   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=24h

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Logging
   LOG_LEVEL=info

   # Security
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## Development

Start the development server:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

## API Documentation

### Authentication Routes
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Message Routes
- GET `/api/messages` - Get messages
- POST `/api/messages` - Send a message
- GET `/api/messages/:id` - Get a specific message

### User Routes
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get a specific user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## Security Features

- Rate limiting
- CORS protection
- XSS protection
- HTTP Parameter Pollution prevention
- Secure session management with Redis
- JWT authentication
- Helmet security headers

## Logging

The application uses Winston for logging. Logs are stored in the `logs` directory:
- `error.log` - Error logs
- `combined.log` - All logs

## Error Handling

The application includes comprehensive error handling:
- Global error handler
- Unhandled promise rejection handler
- Security-related error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 