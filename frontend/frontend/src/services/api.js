import axios from 'axios';

// Use environment variable or fallback to production/development URL
const API_URL = process.env.REACT_APP_API_URL || 'https://fuelsync-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// =====================
// AUTH API
// =====================
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// =====================
// ORDER API
// =====================
export const orderAPI = {
    // Customer routes
    createOrder: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getOrderById: (id) => api.get(`/orders/${id}`),
    simulatePayment: (orderId) => api.post(`/orders/${orderId}/simulate-payment`),

    // Admin routes
    getAllOrders: (params) => api.get('/orders', { params }),
    getPendingOrders: () => api.get('/orders/pending'),
    getOrderStats: () => api.get('/orders/stats'),
    verifyOrder: (data) => api.post('/orders/verify', data),
    completeOrder: (id) => api.put(`/orders/${id}/complete`),
    cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};

// =====================
// PAYMENT API
// =====================
export const paymentAPI = {
    // Customer routes
    createPaymentOrder: (data) => api.post('/payments/create-order', data),
    verifyPayment: (data) => api.post('/payments/verify', data),
    getPaymentStatus: (orderId) => api.get(`/payments/status/${orderId}`),

    // Admin routes
    processRefund: (data) => api.post('/payments/refund', data),
};

// =====================
// TRANSACTION API (Admin creates, customer views)
// =====================
export const transactionAPI = {
    // Admin routes
    createTransaction: (data) => api.post('/transactions', data),
    getTransactions: () => api.get('/transactions'),
    getCustomers: () => api.get('/transactions/customers'),

    // Customer routes
    getMyTransactions: () => api.get('/transactions/my-transactions'),
    getTransactionById: (id) => api.get(`/transactions/${id}`),
};

// =====================
// USER API (Admin only)
// =====================
export const userAPI = {
    getCustomers: () => api.get('/users/customers'),
    getTopCustomers: () => api.get('/users/top-customers'),
    getCustomerById: (id) => api.get(`/users/${id}`),
    updateCustomer: (id, data) => api.put(`/users/${id}`, data),
    deleteCustomer: (id) => api.delete(`/users/${id}`),
};

// =====================
// FUEL PRICE API
// =====================
export const fuelPriceAPI = {
    getFuelPrices: () => api.get('/fuel-prices'),
    updateFuelPrice: (id, data) => api.put(`/fuel-prices/${id}`, data),
};

// =====================
// NOTIFICATION API
// =====================
export const notificationAPI = {
    // Customer routes
    getMyNotifications: () => api.get('/notifications/my'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),

    // Admin routes
    getAllNotifications: () => api.get('/notifications'),
    sendNotification: (data) => api.post('/notifications/send', data),
    broadcastNotification: (data) => api.post('/notifications/broadcast', data),
};

// =====================
// SUPPORT API
// =====================
export const supportAPI = {
    // Customer routes
    createTicket: (data) => api.post('/support', data),
    getMyTickets: () => api.get('/support/my'),
    getTicketById: (id) => api.get(`/support/${id}`),
    replyToTicket: (id, data) => api.post(`/support/${id}/reply`, data),

    // Admin routes
    getAllTickets: (status) => api.get('/support', { params: { status } }),
    updateTicketStatus: (id, status) => api.put(`/support/${id}/status`, { status }),
};

// =====================
// DEPRECATED - Rewards API (Points now used directly in fuel purchases)
// =====================
export const rewardAPI = {
    createRedemption: (data) => api.post('/rewards/redeem', data),
    getRedemptions: () => api.get('/rewards'),
    getMyRedemptions: () => api.get('/rewards/my-redemptions'),
    updateRedemptionStatus: (id, data) => api.put(`/rewards/${id}/status`, data),
    getCustomerApprovedRedemptions: (customerId) => api.get(`/rewards/customer/${customerId}/approved`),
};

export default api;
