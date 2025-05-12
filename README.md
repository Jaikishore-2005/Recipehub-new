# Recipe Hub Backend

A Node.js Express backend for the Recipe Hub application that allows users to create, share and collaborate on recipes.

## Features

- User authentication with JWT
- Recipe CRUD operations
- User management
- Recipe collaboration
- MongoDB database integration

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- MongoDB Atlas account or local MongoDB installation

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user

### Recipes
- `GET /api/recipes` - Get all recipes for the authenticated user
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `GET /api/recipes/public` - Get all public recipes

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## License

MIT 