// README.md
# Home Appliance Service Platform - Backend

## Overview
MERN stack backend for a comprehensive home appliance service and spare parts platform similar to Urban Company.

## Features
- JWT Authentication & Authorization
- Service Booking System
- Spare Parts E-commerce
- Admin Dashboard APIs
- User Management
- Order & Booking Management
- Category & Brand Management
- Review & Rating System
- **Razorpay Payment Integration**
- **Email Notifications with Nodemailer**
- **Real-time Tracking with Socket.io**
- **Image Upload with Cloudinary**

## Tech Stack
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for Authentication
- Bcrypt for Password Hashing
- Express Validator for Input Validation
- **Razorpay for Payment Processing**
- **Nodemailer for Email Notifications**
- **Socket.io for Real-time Updates**
- **Cloudinary for Image Storage**

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/appliance-service
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@applianceservice.com
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Seed the database with sample data:
   ```bash
   node utils/seedData.js
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get single category
- POST `/api/categories` - Create category (Admin)
- PUT `/api/categories/:id` - Update category (Admin)
- DELETE `/api/categories/:id` - Delete category (Admin)

### Services
- GET `/api/services` - Get all services (with filters)
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create service (Admin)
- PUT `/api/services/:id` - Update service (Admin)
- DELETE `/api/services/:id` - Delete service (Admin)

### Spare Parts
- GET `/api/spare-parts` - Get all spare parts (with filters)
- GET `/api/spare-parts/:id` - Get single spare part
- POST `/api/spare-parts` - Create spare part (Admin)
- PUT `/api/spare-parts/:id` - Update spare part (Admin)
- DELETE `/api/spare-parts/:id` - Delete spare part (Admin)

### Bookings
- GET `/api/bookings` - Get all bookings
- GET `/api/bookings/:id` - Get single booking
- POST `/api/bookings` - Create booking (sends confirmation email)
- PUT `/api/bookings/:id/status` - Update booking status (Admin, sends email)
- PUT `/api/bookings/:id/cancel` - Cancel booking
- POST `/api/bookings/:id/rating` - Add rating to booking

### Orders
- GET `/api/orders` - Get all orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order (sends confirmation email)
- PUT `/api/orders/:id/status` - Update order status (Admin, sends email)
- PUT `/api/orders/:id/cancel` - Cancel order

### Users
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- POST `/api/users/addresses` - Add address
- PUT `/api/users/addresses/:addressId` - Update address
- DELETE `/api/users/addresses/:addressId` - Delete address
- PUT `/api/users/:id/role` - Update user role (Admin)

### Payments
- POST `/api/payments/booking/:bookingId/create-order` - Create Razorpay order for booking
- POST `/api/payments/order/:orderId/create-order` - Create Razorpay order for spare parts
- POST `/api/payments/verify` - Verify Razorpay payment

### Image Upload
- POST `/api/upload/single` - Upload single image
- POST `/api/upload/multiple` - Upload multiple images (max 5)

### Real-time Tracking
- POST `/api/tracking/location` - Update technician location (Technician)
- GET `/api/tracking/booking/:bookingId` - Get technician location for booking

## Socket.io Events

### Client Events
- `join-booking` - Join booking room for updates
- `join-order` - Join order room for updates
- `technician-location` - Send technician location update

### Server Events
- `booking-created` - Notify when booking is created
- `order-created` - Notify when order is created
- `status-update` - Notify status changes
- `location-update` - Real-time technician location

## Email Templates
- Booking confirmation
- Order confirmation
- Status updates for bookings and orders

## Default Admin Credentials
- Email: admin@example.com
- Password: admin123

## Models
- User (with roles: user, admin, technician)
- Category (with brands and models)
- Service (repair, installation, maintenance, cleaning)
- SparePart (with compatibility filters)
- Booking (service appointments)
- Order (spare parts orders)
- Notification (user notifications)

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- CORS enabled
- Secure payment processing
- File upload validation

## Payment Flow
1. Create Razorpay order
2. Complete payment on frontend
3. Verify payment signature
4. Update booking/order status
5. Send confirmation email
