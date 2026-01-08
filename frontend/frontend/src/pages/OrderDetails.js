import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Fuel, MapPin, Calendar, DollarSign, Loader, CheckCircle, Clock, XCircle, CreditCard, QrCode, Award, Copy } from 'lucide-react';
import api from '../services/api';

export default function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            // Backend returns order directly or in response.data.order
            setOrder(response.data.order || response.data.data || response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch order details');
            navigate('/app/orders');
        } finally {
            setLoading(false);
        }
    }, [orderId, navigate]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleSimulatePayment = async () => {
        try {
            setPaymentLoading(true);
            await api.post(`/orders/${order._id || order.orderId}/simulate-payment`);
            toast.success('Payment simulated successfully!');
            fetchOrderDetails(); // Refresh order data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment simulation failed');
        } finally {
            setPaymentLoading(false);
        }
    };

    const copyQRData = () => {
        if (order?.qrCodeData) {
            navigator.clipboard.writeText(order.qrCodeData);
            toast.success('QR code data copied!');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Order not found</p>
                <button
                    onClick={() => navigate('/app/orders')}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

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

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'failed':
            case 'refunded':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    // Use liters or quantity (backend uses liters)
    const quantity = order.liters || order.quantity || 0;
    const pricePerLiter = order.pricePerLiter || 0;
    const totalAmount = order.totalAmount || order.totalPrice || (quantity * pricePerLiter);
    const finalAmount = order.finalAmount || totalAmount;
    const creditsApplied = order.creditsApplied || 0;
    const pointsEarned = order.pointsEarned || 0;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <button
                onClick={() => navigate('/app/orders')}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
            </button>

            {/* Main Card */}
            <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Fuel className="w-8 h-8 text-primary" />
                            {order.fuelType ? order.fuelType.charAt(0).toUpperCase() + order.fuelType.slice(1) : 'Fuel'} Order
                        </h1>
                        <p className="text-muted-foreground mt-1">Order ID: {order.orderId || order._id}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
                            <CreditCard className="w-4 h-4" />
                            Payment: {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fuel Details */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Fuel className="w-5 h-5 text-primary" />
                            Fuel Details
                        </h2>
                        <div className="space-y-3 pl-7">
                            <div>
                                <p className="text-sm text-muted-foreground">Fuel Type</p>
                                <p className="text-lg font-semibold text-foreground capitalize">{order.fuelType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantity</p>
                                <p className="text-lg font-semibold text-foreground">{quantity} Liters</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Price per Liter</p>
                                <p className="text-lg font-semibold text-foreground">₹{pricePerLiter.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Pricing
                        </h2>
                        <div className="space-y-3 pl-7 bg-muted rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold text-foreground">₹{totalAmount.toFixed(2)}</span>
                            </div>
                            {creditsApplied > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span>Credits Applied</span>
                                    <span className="font-semibold">-₹{creditsApplied.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <span className="font-semibold text-foreground">Total</span>
                                <span className="text-2xl font-bold text-primary">₹{finalAmount.toFixed(2)}</span>
                            </div>
                            {pointsEarned > 0 && (
                                <div className="flex justify-between items-center text-yellow-600 mt-2 pt-2 border-t border-border">
                                    <span className="flex items-center gap-1">
                                        <Award className="w-4 h-4" />
                                        Points Earned
                                    </span>
                                    <span className="font-semibold">+{pointsEarned.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                {order.qrCodeData && order.status === 'pending' && order.paymentStatus === 'paid' && (
                    <div className="space-y-4 bg-muted rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-primary" />
                            QR Code for Collection
                        </h2>
                        <p className="text-sm text-muted-foreground">Show this QR code at the fuel station to collect your order.</p>
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-4 rounded-lg border border-border">
                                <div className="bg-white flex items-center justify-center">
                                    <QRCode
                                        value={order.qrCodeData}
                                        size={128}
                                        viewBox={`0 0 128 128`}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={copyQRData}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                            >
                                <Copy className="w-4 h-4" />
                                Copy QR Data
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Timeline */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Order Timeline
                    </h2>
                    <div className="space-y-3 pl-7">
                        <div>
                            <p className="text-sm text-muted-foreground">Order Date</p>
                            <p className="text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        {order.expiresAt && (
                            <div>
                                <p className="text-sm text-muted-foreground">Expires At</p>
                                <p className="text-foreground">{new Date(order.expiresAt).toLocaleString()}</p>
                            </div>
                        )}
                        {order.completedAt && (
                            <div>
                                <p className="text-sm text-muted-foreground">Completed Date</p>
                                <p className="text-foreground">{new Date(order.completedAt).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Details */}
                {order.location && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Delivery Location
                        </h2>
                        <div className="bg-muted rounded-lg p-4 pl-7">
                            <p className="text-foreground">{order.location}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border flex gap-3 flex-wrap">
                    {/* Payment Simulation for pending payments */}
                    {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                        <button
                            onClick={handleSimulatePayment}
                            disabled={paymentLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                        >
                            {paymentLoading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4" />
                                    Complete Payment
                                </>
                            )}
                        </button>
                    )}

                    {order.status === 'pending' && (
                        <button
                            onClick={() => toast.info('Contact support to cancel this order')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                        >
                            Request Cancellation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
