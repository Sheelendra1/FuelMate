import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import CreateOrder from './pages/CreateOrder';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Referral from './pages/Referral';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Admin Pages
import AdminCustomers from './pages/admin/Customers';
import AdminOrders from './pages/admin/Orders';
import AdminFuelPrices from './pages/admin/FuelPrices';
import ScanQR from './pages/admin/ScanQR';
import AdminSupport from './pages/admin/Support';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/app/dashboard" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected App Routes */}
                    <Route path="/app" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/app/dashboard" />} />

                        {/* Customer Routes */}
                        <Route path="dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="orders" element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        } />
                        <Route path="order/new" element={
                            <ProtectedRoute>
                                <CreateOrder />
                            </ProtectedRoute>
                        } />
                        <Route path="order/:orderId" element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        } />
                        <Route path="transactions" element={
                            <ProtectedRoute>
                                <Transactions />
                            </ProtectedRoute>
                        } />

                        <Route path="notifications" element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        } />
                        <Route path="support" element={
                            <ProtectedRoute>
                                <Support />
                            </ProtectedRoute>
                        } />
                        <Route path="profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="referral" element={
                            <ProtectedRoute>
                                <Referral />
                            </ProtectedRoute>
                        } />
                        <Route path="settings" element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        } />
                        <Route path="terms" element={
                            <ProtectedRoute>
                                <Terms />
                            </ProtectedRoute>
                        } />
                        <Route path="privacy" element={
                            <ProtectedRoute>
                                <Privacy />
                            </ProtectedRoute>
                        } />

                        {/* Admin Only Routes */}
                        <Route path="admin/customers" element={
                            <ProtectedRoute requireAdmin>
                                <AdminCustomers />
                            </ProtectedRoute>
                        } />
                        <Route path="admin/orders" element={
                            <ProtectedRoute requireAdmin>
                                <AdminOrders />
                            </ProtectedRoute>
                        } />
                        <Route path="admin/fuel-prices" element={
                            <ProtectedRoute requireAdmin>
                                <AdminFuelPrices />
                            </ProtectedRoute>
                        } />
                        <Route path="admin/scan-qr" element={
                            <ProtectedRoute requireAdmin>
                                <ScanQR />
                            </ProtectedRoute>
                        } />

                        <Route path="admin/support" element={
                            <ProtectedRoute requireAdmin>
                                <AdminSupport />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Legacy redirect for old /dashboard path */}
                    <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
