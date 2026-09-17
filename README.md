# 👗 Manisha Traders — Wholesale Dress Distribution & Business Management System

A modern, full-stack **MERN** (MongoDB, Express.js, React, Node.js) business management platform designed for wholesale dress and apparel distribution. It connects distributors with retail boutique partners, manages warehouse inventory with automated stock tracking, facilitates order fulfillment pipelines, and provides executive sales analytics with role-based access control.

---

## 🌟 Key Features

### 👑 Executive Owner Portal
- **Real-Time KPI Dashboard**: Live tracking of total revenue, wholesale order counts, retail customer accounts, catalog items, warehouse valuation, and low-stock alerts.
- **Order Pipeline Tracking**: Visual stage tracking (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` → `Cancelled`).
- **Revenue Analytics**: Interactive sales trend charts powered by Recharts with daily and monthly volume comparisons.
- **Business Policy Controls**: Global distributor settings, minimum wholesale order values, and tiered bulk discount thresholds.

### 🛡️ Role-Based Access Control (RBAC) & Admin Sign-Up Workflow
- **Three distinct user roles**: `Owner`, `Admin` (Staff), and `Customer` (Retail Boutique Partner).
- **Public Admin Application**: Prospective staff can sign up via `/register?role=admin`. New accounts enter a `pending` state and cannot log in until approved.
- **Staff Permission Governance**: The Owner can review pending staff applications, approve/reject them, and toggle granular permissions:
  - *Manage Products & Inventory*
  - *Manage Wholesale Orders*
  - *Manage Customer Accounts*
  - *View Business Analytics*
  - *Manage Platform Policies*
- **Account Suspension / Activation**: Owners and Admins can instantly activate or suspend accounts.

### 📦 Dress Catalog & Inventory Management
- **Catalog Specifications**: Dress categories (Kurtis, Sarees, Salwar Suits, Western Wear, etc.), SKU codes, colorways, and sizes (`XS` to `3XL` and `Free Size`).
- **Wholesale & Purchase Pricing**: Separate purchase cost vs. wholesale rate with automated gross margin calculation.
- **Stock Thresholds & Restock Logs**: Automated low-stock indicators and comprehensive restock/adjustment transaction history (`purchase`, `return`, `damage`, `adjustment`).
- **Safe Order Reservation**: Placing an order reserves inventory; cancelling an order automatically returns reserved quantities to stock.

### 📑 Wholesale Order Fulfillment & Invoicing
- **Multi-Item Order Processing**: Retailers can purchase bulk quantities with minimum order quantity (MOQ) validation.
- **Order Lifecycle Controls**: Step-by-step dispatch workflow with automatic status transitions.
- **Printable Invoices**: Built-in, clean print view for official wholesale invoices with GSTIN and billing details.

### 🎨 Modern Design & User Experience
- Built with **React 19**, **Vite 8**, and **Tailwind CSS v4**.
- **Role-tailored dark sidebar**: Amber/Gold theme for Owner, Indigo/Blue theme for Staff Admins.
- Responsive layout with custom slim scrollbars, card hover transitions, and glassmorphism styling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Tailwind CSS v4, Lucide React, Recharts, Axios |
| **Backend** | Node.js, Express.js (v5), Mongoose (v9), JSON Web Tokens (JWT), bcryptjs, CORS |
| **Database** | MongoDB (Local or MongoDB Atlas) |
| **Tooling** | Dotenv, Nodemon, ESLint |

---

## 📁 Repository Structure

```
Manisha-Traders/
├── client/                     # React + Vite Frontend Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components & ProtectedRoute
│   │   ├── layouts/            # DashboardLayout (Sidebar, Top Navigation)
│   │   ├── pages/              # OwnerDashboard, Products, Orders, Customers, Analytics, Admins, Settings, Login, Register
│   │   ├── services/           # Axios API service integrations
│   │   ├── App.jsx             # Client routing & role guards
│   │   ├── index.css           # Tailwind base styles, scrollbars & animations
│   │   └── main.jsx            # React root entry point
│   ├── .env.example            # Frontend environment variable template
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express REST API Backend
│   ├── config/                 # MongoDB database connection configuration
│   ├── controllers/            # Auth, Admin, Product, Order, Analytics business logic
│   ├── middleware/             # JWT verification & role-based route protection
│   ├── models/                 # Mongoose schemas (User, Product, Order, InventoryTransaction, Settings)
│   ├── routes/                 # API route declarations
│   ├── scripts/                # Database seed scripts (createOwner.js)
│   ├── .env.example            # Backend environment variable template
│   ├── package.json
│   └── server.js               # Express application entry point
│
├── .gitignore                  # Git ignore rules for secrets & build outputs
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Manisha-Traders.git
cd Manisha-Traders
```

---

### 2. Backend Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `server/.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/manisha_traders
   JWT_SECRET=manisha_traders_super_secret_key_change_this
   CLIENT_URL=http://localhost:5173

   # Default Owner Credentials (Used by seed script)
   OWNER_NAME=Sudipto Das
   OWNER_EMAIL=owner@manishatraders.com
   OWNER_PHONE=9876543210
   OWNER_PASSWORD=Sudipto@123
   ```

5. **Seed the Owner Account**:
   Run the owner creation script to initialize the primary administrator account in MongoDB:
   ```bash
   npm run create-owner
   ```

6. Start the backend server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Or standard node
   npm start
   ```
   *The server will run at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a second terminal window and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Verify your `client/.env` configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Manisha Traders
   VITE_APP_VERSION=1.0.0
   ```

5. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## 🔐 Default Owner Credentials

| Field | Value |
|---|---|
| **Portal URL** | [http://localhost:5173/login](http://localhost:5173/login) |
| **Email** | `owner@manishatraders.com` |
| **Password** | `Sudipto@123` |
| **Role** | `owner` (Full unrestricted privileges) |

> ⚠️ **Security Notice**: Remember to update the `JWT_SECRET` and change the default owner password in production environments via the in-app **Settings** page or `.env` configuration.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a customer / retail boutique partner
- `POST /api/auth/admin/register` — Submit a staff admin application (`pending` status)
- `POST /api/auth/login` — Sign in with email and password (returns JWT & user profile)

### Product & Inventory Management (`/api/products`)
- `GET /api/products` — Fetch all products with filter options (category, stock, search)
- `GET /api/products/:id` — Fetch product details by ID
- `POST /api/products` — Create a new dress catalog item *(Owner/Admin with permission)*
- `PUT /api/products/:id` — Update product details or toggle status *(Owner/Admin with permission)*
- `DELETE /api/products/:id` — Delete a product *(Owner/Admin with permission)*
- `POST /api/products/:id/stock` — Adjust stock quantity with reason & log creation
- `GET /api/products/inventory/history` — Fetch inventory stock adjustment logs

### Wholesale Orders (`/api/orders` & `/api/admin/orders`)
- `GET /api/admin/orders` — Retrieve all wholesale orders across the distributor network
- `PUT /api/admin/orders/:id/status` — Advance order status (`confirmed`, `processing`, `shipped`, `delivered`)
- `PUT /api/admin/orders/:id/cancel` — Cancel order and automatically restore stock quantities

### Staff & Customer Governance (`/api/admin`)
- `GET /api/admin/admins` — List approved staff members *(Owner only)*
- `GET /api/admin/admins/applications` — List pending staff applications *(Owner only)*
- `PUT /api/admin/admins/:id/approve` — Approve staff applicant *(Owner only)*
- `PUT /api/admin/admins/:id/reject` — Reject staff applicant *(Owner only)*
- `PUT /api/admin/admins/:id/permissions` — Configure granular staff permissions *(Owner only)*
- `GET /api/admin/customers` — List registered retail boutique partners
- `PUT /api/admin/customers/:id/status` — Activate or suspend a retail customer account

### Analytics & Reports (`/api/analytics`)
- `GET /api/analytics/dashboard` — High-level KPI overview
- `GET /api/analytics/sales` — Daily and monthly wholesale revenue trends
- `GET /api/analytics/inventory` — Stock value, unit totals, and distribution
- `GET /api/analytics/top-products` — Top-selling dress styles by volume and revenue

---

## 🛡️ Security & Architecture Best Practices

- **Strict Password Hashing**: Utilizes `bcryptjs` with salt factor 10.
- **Stateless Authorization**: Protected routes leverage `jsonwebtoken` (JWT) with user ID and role claims validated on every request.
- **Granular Route Middleware**:
  - `authMiddleware`: Verifies token authenticity.
  - `roleMiddleware`: Enforces `owner` vs `admin` vs `customer` hierarchy and individual permission flags.
- **Inventory Concurrency Protection**: Stock quantities are decremented on order placement and safely credited back if cancelled.
- **Isolated Environment Secrets**: All database URIs, signing keys, and ports are isolated in `.env` files and excluded from Git commits via `.gitignore`.

---

## 📄 License

This project is developed for **Manisha Traders**. All rights reserved.
