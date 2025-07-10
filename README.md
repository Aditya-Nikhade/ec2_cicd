# Real-Time Chat Application

[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-featured, real-time chat application built with modern web technologies. This application provides seamless messaging, user authentication, and file sharing capabilities in a responsive, containerized environment.

---

## :sparkles: Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication with Google OAuth 2.0
- **Friend System**: Send, accept, and manage friend requests
- **File Sharing**: Upload and share files with built-in storage
- **Dockerized**: Easy deployment with Docker and Docker Compose
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Scalable**: Microservices architecture with separate frontend and backend services
- **Secure**: Environment-based configuration and secrets management

---

## :bookmark_tabs: Table of Contents

- [Features](#sparkles-features)
- [Architecture](#triangular_ruler-architecture)
- [Tech Stack](#computer-tech-stack)
- [Prerequisites](#rocket-prerequisites)
- [Quick Start](#zap-quick-start)
- [Environment Variables](#key-environment-variables)
- [Development Setup](#wrench-development-setup)
- [Production Deployment](#factory-production-deployment)
- [Project Structure](#file_folder-project-structure)
- [API Endpoints](#link-api-endpoints)
- [Security Features](#lock-security-features)
- [Docker & Docker Compose Usage](#whale-docker--docker-compose-usage)
- [Troubleshooting](#ambulance-troubleshooting)
- [FAQ](#question-faq)
- [Contributing](#handshake-contributing)
- [License](#page_facing_up-license)

---

## :triangular_ruler: Architecture

```mermaid
graph TD;
  subgraph Frontend
    FE["React + Vite"]
  end
  subgraph Backend
    BE["Node.js + Express"]
    Socket["Socket.IO"]
    BE --> Socket
  end
  subgraph Database
    DB["MongoDB"]
    Cache["Redis"]
  end
  subgraph Storage
    S3["AWS S3"]
  end
  FE -- REST/Socket.IO --> BE
  BE -- MongoDB --> DB
  BE -- Redis --> Cache
  BE -- S3 --> S3
```

---

## :computer: Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Authentication**: JWT, Google OAuth 2.0
- **Real-time**: Socket.IO
- **Storage**: AWS S3 (for file uploads)
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx (reverse proxy)

---

## :rocket: Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Node.js >= 18.0.0 (for local development)
- MongoDB Atlas or local MongoDB instance
- Redis server
- AWS S3 bucket (for file storage)
- Google OAuth 2.0 credentials

---

## :zap: Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```
2. **Set up environment variables**
   ```bash
   cp env.development.template .env
   # Edit .env with your values
   ```
3. **Start the application**
   ```bash
   docker-compose up --build
   ```
4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Production Deployment

1. **Set up production environment**
   ```bash
   cp env.production.template .env
   # Edit .env with production values
   ```
2. **Update Google Cloud Console**
   - Add authorized redirect URIs:
     - `https://yourdomain.com/api/auth/google/callback`
     - `https://yourdomain.com/auth/callback`
   - Add authorized JavaScript origins:
     - `https://yourdomain.com`
3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

---

## :key: Environment Variables

Key environment variables to configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend port | `5000` |
| `MONGO_DB_URI` | MongoDB connection string | `mongodb://admin:password@mongodb:27017/demo-chat` |
| `REDIS_URL` | Redis connection string | `redis://:password@redis:6379` |
| `JWT_SECRET` | JWT signing secret | `your-super-secure-secret` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

**Optional Variables:**

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

---

## :wrench: Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demoChat
   ```
2. **Set up environment variables**
   ```bash
   cp env.development.template .env
   # Edit .env with your values
   ```
3. **Start services**
   ```bash
   docker-compose up --build
   # Or start in background
   docker-compose up -d --build
   # View logs
   docker-compose logs -f
   ```
4. **Stop services**
   ```bash
   docker-compose down
   ```

---

## :factory: Production Deployment

1. **Environment Setup**
   ```bash
   cp env.production.template .env
   # Edit .env with production values
   ```
2. **Update Configuration**
   - Use external MongoDB/Redis services
   - Set strong JWT secrets
   - Configure proper CORS origins
   - Set up SSL certificates
3. **Deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

---

## :file_folder: Project Structure

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

---

## :link: API Endpoints

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

---

## :lock: Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- XSS protection
- Secure headers with Helmet

---

## :whale: Docker & Docker Compose Usage

### Build and Run All Services
```bash
docker-compose up --build
```

### Run in Background
```bash
docker-compose up -d --build
```

### Stop and Remove Containers
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Access a Shell in a Container
```bash
docker-compose exec backend sh
```

---

## :ambulance: Troubleshooting

- **Port Already in Use:**
  - Make sure ports 5000 (backend) and 5173/80 (frontend) are free.
- **Environment Variables Not Loaded:**
  - Ensure `.env` file exists and is correctly configured.
- **Database/Redis Connection Issues:**
  - Check your connection strings and that services are running.
- **Build Failures:**
  - Run `docker-compose build --no-cache` to force a clean build.
- **File Uploads Not Working:**
  - Verify AWS S3 credentials and bucket permissions.

---

## :question: FAQ

**Q: Can I run the app without Docker?**
A: Yes, start backend and frontend separately using Node.js and npm. Docker is recommended for consistency.

**Q: How do I add a new environment variable?**
A: Add it to your `.env` file and reference it in your code/configuration.

**Q: How do I scale services?**
A: Use `docker-compose up --scale backend=3` to run multiple backend containers.

**Q: Where are uploaded files stored?**
A: Files are uploaded to AWS S3. Local uploads go to the `backend/uploads/` directory (if enabled).

---

## :handshake: Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## :page_facing_up: License

This project is licensed under the MIT License. 