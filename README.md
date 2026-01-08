# FuelMate ⛽

FuelMate is a smart fuel management and loyalty application designed to streamline fuel purchasing and rewards. It allows users to prepay for fuel, earn loyalty points, and redeem them for discounts, while providing Station Admins with powerful tools to manage sales, customers, and fuel prices.

## 🚀 Features

### For Customers
- **Prepaid Fuel Orders**: Lock in fuel prices by buying in advance.
- **QR Code Redemption**: Seamlessly redeem fuel at the pump using a secure QR code.
- **Loyalty Program**: Earn points on every transaction and climb tiers (Silver, Gold, Platinum).
- **Real-time Dashboard**: Track available fuel, points, and transaction history.
- **Support System**: Submit and track support tickets directly from the app.

### For Admins
- **Station Dashboard**: Visual analytics of weekly sales, revenue, and customer growth.
- **Order Management**: Scan QR codes to fulfill orders and verify transactions.
- **Customer Management**: View user profiles, points, and tiers.
- **Fuel Price Control**: Update daily fuel rates (Petrol/Diesel) instantly.
- **Support Tickets**: Respond to and resolve customer inquiries.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Recharts
- **Authentication**: JWT (JSON Web Tokens)

## 📦 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a MongoDB Atlas connection string.

---

### 1. Backend Setup

Initialize the server and database connection.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` folder and add the following configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fuelmate
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=30d
   ```
   *(Note: Replace `mongodb://localhost...` with your Atlas URI if using cloud database)*

4. Start the server:
   ```bash
   npm run dev
   ```
   The backend should now be running on `http://localhost:5000`.

---

### 2. Frontend Setup

Launch the web application.

1. Navigate to the frontend directory:
   ```bash
   cd frontend/frontend
   ```
   *(Note: The double frontend folder structure is intentional for this setup)*

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file in `frontend/frontend` if you need to point to a different backend URL (default is usually proxied or localhost:5000):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the application:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`.

---

## 📂 Project Structure

```
FuelMate/
├── backend/                # Node.js API Server
│   ├── config/             # DB Configuration
│   ├── controllers/        # Route Logic
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   └── server.js           # Entry Point
├── frontend/frontend/      # React Web App
│   ├── public/             
│   └── src/
│       ├── components/     # Reusable UI Components
│       ├── context/        # Auth & State Context
│       ├── pages/          # Full Page Views (Admin & User)
│       └── services/       # API Call Functions
└── README.md               # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
Developed by **Sheelendra Singh**