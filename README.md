# 🗑️ UrbanWasteX - Smart Waste Management System

<div align="center">

![UrbanWasteX Logo](frontend/src/assets/urbanwastex.png)

**A modern, full-stack waste management solution for urban communities**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-success.svg)](https://www.mongodb.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Testing](#-testing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)


---

## 🌟 Overview

**UrbanWasteX** is a comprehensive waste management system designed to streamline waste collection, billing, payments, and rewards for residential communities. The platform offers real-time container monitoring, automated billing, integrated payment processing, and a reward system to encourage sustainable waste disposal practices.

### 🎯 Key Objectives

- **Efficient Waste Collection**: Schedule and track waste pickups with real-time updates
- **Automated Billing**: Generate and manage bills based on waste collection data
- **Integrated Payments**: Multiple payment options including wallet, card, and cash
- **Rewards System**: Incentivize recycling and proper waste segregation
- **Container Monitoring**: IoT-enabled containers with fill-level sensors
- **Admin Dashboard**: Comprehensive analytics and reporting tools

---

## ✨ Features

### 🏠 User Features

#### 📅 Waste Collection Management
- **Schedule Pickups**: Book waste collection for specific dates and times
- **Real-time Tracking**: Monitor collection status from scheduled to completed
- **Multiple Waste Types**: Support for recyclables, compost, general waste, hazardous, and e-waste
- **Confirmation System**: Receive unique confirmation IDs for each collection

#### 💳 Billing & Payments
- **Automated Billing**: Bills generated based on waste collection data
- **Multiple Payment Methods**:
  - Digital Wallet (with balance tracking)
  - Credit/Debit Card
  - UPI/Bank Transfer
  - Cash at Office
- **Batch Payments**: Pay multiple bills at once
- **Payment History**: Complete transaction records with receipts
- **Email Receipts**: Automatic receipt generation and email delivery

#### 🎁 Rewards System
- **Earn Rewards**: Get points for recycling and proper waste segregation
- **Reward Types**:
  - Recyclables: 1.0 LKR per kg
  - Compost: 0.5 LKR per kg
  - E-Waste: 2.0 LKR per kg
- **Redeem Rewards**: Apply rewards to bill payments
- **Reward History**: Track earned and used rewards

#### 💰 Digital Wallet
- **Balance Management**: Top-up and track wallet balance
- **Transaction History**: View all credits and debits
- **Instant Payments**: Pay bills directly from wallet
- **Overflow Credits**: Excess payment amounts credited back to wallet

### 👨‍💼 Admin Features

#### 📊 Dashboard & Analytics
- **Real-time Metrics**: Active users, pending collections, revenue tracking
- **Visual Reports**: Charts and graphs for waste collection trends
- **Container Monitoring**: Live fill levels of all containers
- **Bill Management**: View, update, and manage all user bills

#### 🗑️ Container Management
- **Container Registry**: Add and manage waste containers
- **IoT Integration**: Real-time fill level monitoring
- **Location Tracking**: GPS-enabled container locations
- **Maintenance Alerts**: Notifications for container servicing

#### 📈 Reporting System
- **Custom Reports**: Generate reports by date range, waste type, province
- **Export Options**: Download reports as PDF or CSV
- **Revenue Analytics**: Track payment methods and revenue streams
- **User Statistics**: Analyze user behavior and collection patterns

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js v5
- **Database**: MongoDB 8.0 (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **Security**: bcryptjs for password hashing
- **Testing**: Jest + Supertest

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Development**: Nodemon (hot reload)
- **Build Tool**: Vite
- **Linting**: ESLint
- **Package Manager**: npm

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages     │  │  Components  │  │   Services   │       │
│  │ (Views/UI)  │  │  (Reusable)  │  │ (API Calls)  │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (HTTP/HTTPS)
┌───────────────────────────┴─────────────────────────────────┐
│                      Backend (Express.js)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Controllers │  │   Services   │  │ Repositories │       │
│  │  (Routes)   │  │ (Bus. Logic) │  │ (DB Access)  │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Middlewares │  │    Models    │  │    Utils     │       │
│  │(Auth/Valid) │  │  (Schemas)   │  │  (Helpers)   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────┴─────────────────────────────────┐
│                    Database (MongoDB Atlas)                  │
│   Users | Bills | Transactions | Wallets | Rewards          │
│   Containers | WasteCollections                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v6.0 or higher (or MongoDB Atlas account)
- **Git**: Latest version

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/urbanwastex.git
cd urbanwastex
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file (if needed)
cp .env.example .env
```

### 4️⃣ Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### 5️⃣ Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/UrbanWasteX?retryWrites=true&w=majority
MONGO_URI_TEST=mongodb+srv://username:password@cluster.mongodb.net/UrbanWasteX-Test?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Service (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Environment
NODE_ENV=development
```

### Frontend `.env` (Optional)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "address": "123 Main St",
  "province": "Western"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Waste Collection Endpoints

#### Schedule Pickup
```http
POST /api/waste-collections
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "123 Main St",
  "province": "Western",
  "wasteType": "Recyclables",
  "scheduledDate": "2025-11-16",
  "scheduledTime": "10:00",
  "notes": "Large items included"
}
```

#### Get User Collections
```http
GET /api/waste-collections/my-collections?status=Scheduled
Authorization: Bearer <token>
```

### Bill Endpoints

#### Get User Bills
```http
GET /api/bills/my-bills?status=due
Authorization: Bearer <token>
```

#### Pay Multiple Bills
```http
POST /api/bills/batch-pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "billIds": ["bill_id_1", "bill_id_2"],
  "paymentMethod": "wallet",
  "useWallet": true,
  "applyRewards": true
}
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/wallet/:residentId
Authorization: Bearer <token>
```

#### Add Funds
```http
POST /api/wallet/add-funds
Authorization: Bearer <token>
Content-Type: application/json

{
  "residentId": "user_id",
  "amount": 500
}
```

### Reward Endpoints

#### Get User Rewards
```http
GET /api/rewards/my-rewards
Authorization: Bearer <token>
```

---

## 🧪 Testing

### Run All Tests

```bash
cd backend
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Structure

```
tests/
├── setup.js              # MongoDB connection setup
├── bill.test.js          # Bill model tests
├── transaction.test.js   # Transaction model tests
├── wallet.test.js        # Wallet model tests
└── reward.test.js        # Reward model tests
```

### Sample Test Output

```
PASS  tests/bill.test.js
PASS  tests/wallet.test.js
PASS  tests/transaction.test.js
PASS  tests/reward.test.js

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        5.432 s
```

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── billController.js        # Bill management
│   ├── walletController.js      # Wallet operations
│   ├── rewardController.js      # Reward management
│   └── wasteCollectionController.js
├── models/
│   ├── User.js                  # User schema
│   ├── Bill.js                  # Bill schema
│   ├── Transaction.js           # Transaction schema
│   ├── Wallet.js                # Wallet schema
│   ├── Reward.js                # Reward schema
│   └── WasteCollection.js       # Collection schema
├── routes/
│   ├── authRoutes.js
│   ├── billRoutes.js
│   ├── walletRoutes.js
│   ├── rewardRoutes.js
│   └── wasteCollectionRoutes.js
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   └── adminMiddleware.js       # Admin authorization
├── services/
│   ├── billService.js           # Bill business logic
│   └── transactionService.js    # Transaction logic
├── utils/
│   ├── sendEmail.js             # Email utilities
│   ├── validation.js            # Input validation
│   └── generateReceiptHTML.js   # Receipt generation
├── tests/
│   └── *.test.js                # Jest tests
├── .env                         # Environment variables
├── server.js                    # Express app entry
└── package.json
```

### Frontend Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── urbanwastex.png
│   ├── components/
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── AdminLayout.jsx
│   │   ├── payments/
│   │   │   ├── BillsCard.jsx
│   │   │   ├── CheckoutModal.jsx
│   │   │   ├── ReceiptDrawer.jsx
│   │   │   └── WalletCard.jsx
│   │   └── common/
│   │       └── PDFGenerator.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── Profile.jsx
│   │   └── ContainerManagement/
│   ├── Services/
│   │   ├── billServices.js
│   │   ├── paymentServices.js
│   │   ├── rewardServices.js
│   │   └── wasteCollectionService.js
│   ├── context/
│   │   └── UserContext.jsx      # Auth context
│   ├── utils/
│   │   ├── authUtils.js
│   │   └── paymentCalculator.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS policies
- **Environment Variables**: Sensitive data in `.env` files
- **MongoDB Injection Prevention**: Mongoose query sanitization

---

### Coding Standards

- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 👥 Authors

- **Sithmaka Nanayakkara** - *Payment Management* - [GitHub](https://github.com/chamithusithmaka)
- **Imal Ayodya** - *Schedule Waste Collection* - [GitHub](https://github.com/ImalAyodya)
- **Malmi Bandara** - *Container Waste Management* - [GitHub](https://github.com/YeshaniB)
- **Pasan Amarasinghe** - *Generate Reports for Authorities* - [GitHub](https://github.com/Pasan115)

---

<div align="center">


[⬆ Back to Top](#-urbanwastex---smart-waste-management-system)

</div>
