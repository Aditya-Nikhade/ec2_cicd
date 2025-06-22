# Demo Chat Application

A real-time chat application built with React, Node.js, MongoDB, and Redis, containerized with Docker.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Friend requests and management
- File upload support
- Responsive design
- Docker containerization

## Prerequisites

- Docker and Docker Compose
- Node.js >= 18.0.0 (for local development)
- MongoDB >= 4.4
- Redis >= 6.0

## Quick Start with Docker

### 1. Environment Setup

First, set up your environment variables:

**For Development:**
```bash
cp env.development.template .env
```

**For Production:**
```bash
cp env.production.template .env
```

Then edit the `.env` file with your actual values.

### 2. Start the Application

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file based on the templates:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend port | `5000` |
| `MONGO_DB_URI` | MongoDB connection string | `mongodb://admin:password@mongodb:27017/demo-chat` |
| `REDIS_URL` | Redis connection string | `redis://:password@redis:6379` |
| `JWT_SECRET` | JWT signing secret | `your-super-secure-secret` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `password123` |
| `REDIS_PASSWORD` | Redis password | `your_redis_password` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `my-bucket` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `user@gmail.com` |
| `SMTP_PASS` | SMTP password | `app-password` |

## Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd demoChat
```

### 2. Set up environment variables
```bash
cp env.development.template .env
# Edit .env with your values
```

### 3. Start services
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 4. Stop services
```bash
docker-compose down
```

## Production Deployment

### 1. Environment Setup
```bash
cp env.production.template .env
# Edit .env with production values
```

### 2. Update Configuration
- Use external MongoDB/Redis services
- Set strong JWT secrets
- Configure proper CORS origins
- Set up SSL certificates

### 3. Deploy
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Project Structure

```
demoChat/
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── socket/            # Socket.IO handlers
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── context/       # React context
│   └── package.json
├── docker-compose.yml     # Docker services
├── .env                   # Environment variables (create from template)
├── env.development.template
├── env.production.template
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Messages
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message

### Friends
- `GET /api/friends/requests` - Get friend requests
- `POST /api/friends/request/:userId` - Send friend request
- `PUT /api/friends/accept/:userId` - Accept friend request
- `DELETE /api/friends/reject/:userId` - Reject friend request

## Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- XSS protection
- Secure headers with Helmet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 