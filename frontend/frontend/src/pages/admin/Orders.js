import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Package, Loader, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import api from '../../services/api';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            let endpoint = '/orders';
            if (filter === 'pending') {
                endpoint = '/orders/pending';
            } else if (filter !== 'all') {
                endpoint = `/orders?status=${filter}`;
            }
            const response = await api.get(endpoint);
            setOrders(Array.isArray(response.data) ? response.data : (response.data.orders || response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const completeOrder = async (orderId) => {
        try {
            setActionLoading(true);
            await api.put(`/orders/${orderId}/complete`);
            toast.success('Order completed successfully');
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
        } finally {
            setActionLoading(false);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setActionLoading(true);
            await api.put(`/orders/${orderId}/cancel`);
            toast.success('Order cancelled successfully');
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setActionLoading(false);
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
                return 'bg-gray-100 text-gray-800';
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

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Package className="w-8 h-8 text-primary" />
                    Order Management
                </h1>
                <p className="text-muted-foreground mt-1">View and manage customer orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Pending Orders</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-3xl font-bold text-green-500 mt-2">
                        {orders.filter(o => o.status === 'completed').length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Cancelled</p>
                    <p className="text-3xl font-bold text-red-500 mt-2">
                        {orders.filter(o => o.status === 'cancelled').length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary mt-2">
                        ₹{orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['pending', 'completed', 'cancelled', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-muted'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map(order => (
                            <div
                                key={order._id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                Order: {order.fuelType || 'Fuel'}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Order ID: {order._id.substring(0, 8)}...
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            ₹{(order.finalAmount || order.totalAmount || order.totalPrice || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 border-t border-b border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p>
                                        <p className="font-semibold text-foreground text-sm">{order.customerName || order.customerId?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Fuel Type</p>
                                        <p className="font-semibold text-foreground text-sm">{order.fuelType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Quantity</p>
                                        <p className="font-semibold text-foreground text-sm">{order.liters || order.quantity}L</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Price/L</p>
                                        <p className="font-semibold text-foreground text-sm">₹{(order.pricePerLiter || 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                                        <p className="font-semibold text-foreground text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-2xl text-muted-foreground hover:text-foreground transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <p className="text-lg font-semibold text-foreground">{selectedOrder._id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="text-foreground">{selectedOrder.customerId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fuel Type</p>
                                <p className="text-foreground">{selectedOrder.fuelType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantity</p>
                                <p className="text-foreground">{selectedOrder.quantity} Liters</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Price</p>
                                <p className="text-2xl font-bold text-primary">₹{(selectedOrder.totalPrice || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Delivery Location</p>
                                <p className="text-foreground">{selectedOrder.location || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-border">
                            {selectedOrder.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => completeOrder(selectedOrder._id)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                                    >
                                        {actionLoading ? 'Completing...' : 'Complete Order'}
                                    </button>
                                    <button
                                        onClick={() => cancelOrder(selectedOrder._id)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition font-medium"
                                    >
                                        {actionLoading ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
