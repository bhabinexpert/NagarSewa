# NagarSewa (नगरसेवा)

<div align="center">

**Digital Public Service Platform for Nepalese Municipalities**

[![Node.js](https://img.shields.io/badge/Node.js-v24.12.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 📖 Overview

NagarSewa is a comprehensive civic engagement platform designed specifically for Nepalese municipalities. It bridges the gap between citizens and local government by providing a digital infrastructure for:

- 🏛️ **Ward-based Administration** - Multi-tier admin system with super admin and ward-specific administrators
- 📋 **Issue Reporting & Tracking** - Citizens can report civic issues with real-time status updates
- 🎯 **Community Campaigns** - Request and participate in community development initiatives
- 📊 **Analytics Dashboard** - Data-driven insights for municipal decision-making
- 🔔 **Notification System** - Real-time updates for citizens and administrators
- 🌐 **Bilingual Support** - Full English and Nepali language support

## 🏗️ Architecture

## 🏗️ Architecture

```
NagarSewa/
├── Backend/                           # Node.js/Express REST API
│   ├── src/
│   │   ├── api/                       # Third-party API integrations
│   │   │   └── api.location.js        # Nepal location services
│   │   ├── controllers/               # Business logic layer
│   │   │   └── Authorization.controllers.js
│   │   ├── middleware/                # Request processing
│   │   │   └── auth.js                # JWT authentication & authorization
│   │   ├── models/                    # Data access layer
│   │   │   ├── User.js                # User & admin management
│   │   │   ├── Issue.js               # Issue tracking
│   │   │   └── Campaign.js            # Campaign management
│   │   ├── routes/                    # API endpoints
│   │   │   ├── adminRoutes.js         # Admin operations
│   │   │   ├── campaigns.js           # Campaign routes
│   │   │   └── userRoute.js           # User operations
│   │   ├── db.js                      # PostgreSQL connection
│   │   ├── app.js                     # Express configuration
│   │   └── server.js                  # Application entry point
│   ├── .env                           # Environment variables
│   └── package.json
│
├── Frontend/                          # React/Vite SPA
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── common/                # Header, Footer, etc.
│   │   │   ├── dashboard/             # Dashboard components
│   │   │   │   ├── admin/             # Admin panel components
│   │   │   │   └── user/              # User dashboard components
│   │   │   └── landing/               # Landing page sections
│   │   ├── contexts/                  # React Context providers
│   │   │   ├── auth/                  # Authentication state
│   │   │   └── language/              # i18n state management
│   │   ├── pages/                     # Route pages
│   │   │   ├── auth/                  # Login/Signup
│   │   │   └── dashboard/             # Dashboard views
│   │   ├── services/                  # API client
│   │   │   └── api.js                 # HTTP service layer
│   │   ├── utils/                     # Helper functions
│   │   │   └── nepalLocation.js       # Nepal geographic data
│   │   ├── App.jsx                    # Root component
│   │   └── main.jsx                   # Application entry
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based authentication
- **Role-based Access Control** - Three-tier system (Super Admin, Ward Admin, User)
- **Password Security** - bcrypt hashing with salt rounds
- **Session Management** - 24-hour token expiry with auto-validation

### 👥 User Management
- **Self-registration** - Citizens can create accounts independently
- **KYC Verification** - Admin-approved identity verification
- **Profile Management** - Update personal information and preferences
- **Ward Assignment** - Automatic ward-based data segregation

### 🛡️ Admin System
- **Super Admin** - Full system access across all 10 wards
  - Create and manage ward administrators
  - View system-wide analytics
  - Deactivate/Reactivate admin accounts
- **Ward Admin** - Ward-specific administrative access
  - Manage issues within their ward
  - Approve campaign requests
  - KYC verification for ward residents
  - Ward-specific dashboard and reports

### 📱 User Features
- **Issue Reporting** - Report civic issues with photos and location
- **Campaign Requests** - Request community development campaigns
- **Real-time Tracking** - Monitor issue status and resolution
- **Notifications** - Stay updated on issue progress
- **News Feed** - Community updates and announcements

### 🌍 Localization
- **Bilingual Interface** - Seamless English/Nepali switching
- **Nepal-specific Data** - Province, district, and ward information
- **Culturally Relevant** - Designed for Nepalese civic processes

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE nagar_sewa;
   -- Run migrations when implemented
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 📚 Documentation

- **[Backend Integration Guide](Backend/docs/integration.md)** - Complete API documentation and frontend integration examples
- **[Backend Setup Guide](Backend/BACKEND_SETUP_GUIDE.txt)** - Detailed backend setup instructions

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** Custom middleware
- **File Upload:** Multer (planned)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** CSS Modules / Tailwind CSS (planned)
- **State Management:** React Context
- **Routing:** React Router (planned)
- **HTTP Client:** Fetch API

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start development server with hot reload
npm start        # Start production server
npm test         # Run tests (when implemented)
npm run lint     # Run ESLint
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
PG_USER=your_db_user
PG_HOST=localhost
PG_DATABASE=nagar_sewa
PG_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development Team:** NagarSewa Contributors
- **Contact:** [contact@nagar-sewa.com](mailto:contact@nagar-sewa.com)

## 🎯 Roadmap

- [ ] Complete user authentication system
- [ ] Implement issue reporting and tracking
- [ ] Add campaign management features
- [ ] Admin dashboard with analytics
- [ ] Notification system
- [ ] File upload functionality
- [ ] Mobile-responsive design
- [ ] Multi-language support (Nepali/English)
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization