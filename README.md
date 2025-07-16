# LinkedIn Clone - Industrial Grade Social Network

A comprehensive, production-ready LinkedIn clone built with modern technologies and industrial best practices.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role management
- **Professional Profiles** - Complete user profiles with experience, education, skills
- **Social Feed** - Post creation, likes, comments, shares with real-time updates
- **Job Board** - Job posting, searching, filtering, and application system
- **Professional Networking** - Connection requests, network building
- **Real-time Messaging** - Chat system with Socket.IO
- **Company Pages** - Company profiles and job postings
- **File Uploads** - Profile pictures, cover photos, documents with Cloudinary
- **Advanced Search** - Users, jobs, companies with filtering
- **Notifications** - Real-time notifications for all activities
- **Analytics Dashboard** - User engagement and platform analytics

### Technical Features
- **Industrial Architecture** - Modular, scalable codebase
- **Security** - Helmet, CORS, rate limiting, input validation
- **Error Handling** - Comprehensive error boundaries and logging
- **Testing** - Unit and integration tests
- **Docker Support** - Full containerization with Docker Compose
- **CI/CD Ready** - GitHub Actions workflows
- **Monitoring** - Winston logging, health checks
- **Performance** - Caching, compression, optimization

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form handling
- **React Query** - Server state management
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Nodemailer** - Email service
- **Winston** - Logging
- **Joi** - Validation

### DevOps & Tools
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Redis** - Caching
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6+
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git remote add origin https://github.com/saifakhtar09/LinkedinCloneWeb.git

cd linkedinc
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Or use your local MongoDB installation
```

### 5. Run the application
```bash
# Development mode (both frontend and backend)
npm run dev

# Backend only
npm run server:dev

# Frontend only
npm run client:dev
```

### 6. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
docker-compose up -d
```

### Production Deployment
```bash
# Build production image
docker build -t linkedin-clone .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
linkedin-clone/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── common/             # Reusable components
│   │   ├── Auth/               # Authentication components
│   │   ├── Feed/               # Social feed components
│   │   ├── Jobs/               # Job-related components
│   │   ├── Profile/            # Profile components
│   │   └── Layout/             # Layout components
│   ├── store/                  # Redux store
│   │   └── slices/             # Redux slices
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── App.jsx                 # Main App component
├── server/                      # Backend source
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Express middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── utils/                  # Utility functions
│   └── index.js               # Server entry point
├── tests/                      # Test files
├── docs/                       # Documentation
├── docker-compose.yml          # Docker Compose config
├── Dockerfile                  # Docker configuration
├── nginx.conf                  # Nginx configuration
└── package.json               # Dependencies
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Database Setup
The application uses MongoDB with the following collections:
- users
- posts
- jobs
- companies
- messages
- notifications

### File Upload Setup
Configure Cloudinary for file uploads:
1. Create a Cloudinary account
2. Add your credentials to `.env`
3. Configure upload limits in `src/utils/constants.js`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-profile-picture` - Upload profile picture
- `GET /api/users/search` - Search users

### Post Endpoints
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Job Endpoints
- `GET /api/jobs` - Get jobs with filters
- `POST /api/jobs` - Create job posting
- `POST /api/jobs/:id/apply` - Apply for job

## 🔒 Security Features

- **Authentication** - JWT-based with refresh tokens
- **Authorization** - Role-based access control
- **Input Validation** - Joi schema validation
- **Rate Limiting** - Express rate limiter
- **Security Headers** - Helmet.js
- **CORS** - Configured for production
- **File Upload Security** - Type and size validation
- **SQL Injection Prevention** - MongoDB ODM protection
- **XSS Protection** - Input sanitization

## 🚀 Performance Optimizations

- **Caching** - Redis for session and data caching
- **Compression** - Gzip compression
- **Image Optimization** - Cloudinary transformations
- **Database Indexing** - Optimized MongoDB queries
- **Code Splitting** - React lazy loading
- **Bundle Optimization** - Vite build optimization

## 📈 Monitoring & Logging

- **Winston Logging** - Structured logging with levels
- **Health Checks** - Application health monitoring
- **Error Tracking** - Comprehensive error handling
- **Performance Metrics** - Response time tracking
- **User Analytics** - Engagement tracking

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing
- Code quality checks
- Security scanning
- Docker image building
- Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the FAQ section

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video calling integration
- [ ] AI-powered job recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA)
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Machine learning features

---

Built with ❤️ using modern web technologies by Saif
