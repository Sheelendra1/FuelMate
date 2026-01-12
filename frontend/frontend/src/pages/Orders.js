import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Eye, Clock, CheckCircle, XCircle, Fuel, Loader, Calendar } from 'lucide-react';
import api from '../services/api';

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data.orders || response.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    // Date filter logic
    const isInDateRange = (orderDate) => {
        if (dateFilter === 'all') return true;

        const now = new Date();
        const orderDateObj = new Date(orderDate);

        switch (dateFilter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return orderDateObj >= today;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDateObj >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return orderDateObj >= monthAgo;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return orderDateObj >= yearAgo;
            default:
                return true;
        }
    };

    const filteredOrders = orders.filter(order => {
        // Status filter
        const statusMatch = statusFilter === 'all' || order.status === statusFilter;
        // Date filter
        const dateMatch = isInDateRange(order.createdAt);
        return statusMatch && dateMatch;
    });

    const dateFilterOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Fuel className="w-8 h-8 text-primary" />
                        My Orders
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage and track your fuel orders</p>
                </div>
                <button
                    onClick={() => navigate('/app/order/new')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Order
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                {/* Status Filters */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Status</p>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pending', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${statusFilter === status
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Filters */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Filter by Date
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {dateFilterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setDateFilter(option.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${dateFilter === option.value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <Fuel className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">No orders found</p>
                        <button
                            onClick={() => navigate('/app/order/new')}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                        >
                            Create Your First Order
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map(order => (
                            <div
                                key={order._id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {order.fuelType || 'Fuel'} Order
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Order ID: {order.orderId || order._id?.substring(0, 8) + '...'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            ₹{(order.finalAmount || order.totalAmount || 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.liters || order.quantity} liters
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Fuel Type</p>
                                        <p className="font-semibold text-foreground">{order.fuelType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Quantity</p>
                                        <p className="font-semibold text-foreground">{order.liters || order.quantity}L</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Price/L</p>
                                        <p className="font-semibold text-foreground">₹{(order.pricePerLiter || 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                                        <p className="font-semibold text-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                    <button
                                        onClick={() => navigate(`/app/order/${order.orderId || order._id}`)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
