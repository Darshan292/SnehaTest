# P2P Learning Platform

A complete peer-to-peer learning platform built with React, Node.js, Express, and MongoDB. Users can ask questions, provide answers, and earn credits for helping others learn.

## Features

- **User Authentication**: Secure registration and login system
- **Question & Answer System**: Post questions with credit rewards
- **Credit System**: Earn and spend credits for knowledge sharing
- **Real-time Updates**: Live notifications and updates using Socket.IO
- **Leaderboard**: Gamified ranking system
- **User Profiles**: Comprehensive user profiles with achievements
- **Payment System**: Internal credit-based payment system
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Socket.IO client for real-time features

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.IO for real-time communication
- bcryptjs for password hashing
- Express validation and rate limiting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd p2p-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/p2p-learning-platform
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   
   For development (runs both frontend and backend):
   ```bash
   npm run dev:full
   ```
   
   Or run them separately:
   ```bash
   # Backend only
   npm run dev:backend
   
   # Frontend only (in another terminal)
   npm run dev:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/notifications` - Get user notifications
- `PUT /api/users/notifications/:id/read` - Mark notification as read

### Questions
- `GET /api/questions` - Get all questions (with pagination and filters)
- `GET /api/questions/:id` - Get single question with responses
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `PUT /api/questions/:id/solve` - Mark question as solved

### Responses
- `POST /api/responses` - Create new response
- `PUT /api/responses/:id` - Update response
- `DELETE /api/responses/:id` - Delete response
- `PUT /api/responses/:id/helpful` - Mark response as helpful
- `PUT /api/responses/:id/vote` - Vote on response

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history
- `GET /api/payments/:id` - Get payment details

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/stats` - Get platform statistics

## Database Schema

### User Model
- Username, email, password (hashed)
- Credits, questions asked, doubts resolved
- Achievements and notifications
- Profile information

### Question Model
- Title, description, credits offered
- Author, status (open/solved/closed)
- Tags, views, votes
- Timestamps

### Response Model
- Content, question reference
- Author, credits requested
- Helpful status, votes
- Payment history

### Payment Model
- From/to users, amount
- Question and response references
- Transaction status and details

## Features in Detail

### Credit System
- Users start with 100 credits
- Credits are deducted when posting questions
- Credits are earned by providing helpful responses
- Internal payment system for rewarding good answers

### Real-time Features
- Live notifications for new responses
- Real-time question updates
- Payment completion notifications

### Gamification
- Achievement system with badges
- Leaderboard with multiple sorting options
- User rankings and statistics

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization

## Development

### Project Structure
```
├── server/                 # Backend code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── src/                   # Frontend code
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── data/             # Dummy data (for development)
└── public/               # Static assets
```

### Available Scripts
- `npm run dev:full` - Run both frontend and backend
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.