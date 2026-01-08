import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Fuel, DollarSign, Loader, CreditCard } from 'lucide-react';
import api from '../services/api';

export default function CreateOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fuelPrices, setFuelPrices] = useState([]);
    const [formData, setFormData] = useState({
        fuelType: '',
        quantity: '',
        paymentMethod: 'upi' // Default to valid enum
    });
    const [pricePerLiter, setPricePerLiter] = useState(0);

    useEffect(() => {
        fetchFuelPrices();
    }, []);

    const fetchFuelPrices = async () => {
        try {
            const response = await api.get('/fuel-prices');
            const prices = response.data || [];
            setFuelPrices(prices);
            if (prices.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    fuelType: prices[0].fuelType
                }));
                setPricePerLiter(prices[0].pricePerLiter || 0);
            }
        } catch (error) {
            toast.error('Failed to fetch fuel prices');
            console.error(error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'fuelType') {
            const fuel = fuelPrices.find(f => f.fuelType === value);
            setPricePerLiter(fuel?.pricePerLiter || 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fuelType || !formData.quantity) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const totalAmount = parseFloat(formData.quantity) * pricePerLiter;

            const response = await api.post('/orders', {
                fuelType: formData.fuelType,
                liters: parseFloat(formData.quantity),
                totalAmount,
                finalAmount: totalAmount,
                paymentMethod: formData.paymentMethod, // Use selected valid method
            });

            toast.success('Order created successfully!');
            const orderId = response.data.order?.orderId || response.data.order?._id || response.data._id;
            navigate(`/app/order/${orderId}`);
        } catch (error) {
            console.error('Create order error:', error);
            const msg = error.response?.data?.message || 'Failed to create order';
            // Show detailed error if validation fails
            if (msg.includes('paymentMethod')) {
                toast.error('Invalid payment method selected');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = parseFloat(formData.quantity || 0) * pricePerLiter;

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/app/orders')}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
            </button>

            <div className="bg-card border border-border rounded-lg p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Fuel className="w-8 h-8 text-primary" />
                        Create New Order
                    </h1>
                    <p className="text-muted-foreground mt-2">Order fuel now and pay in advance</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Fuel Type *
                        </label>
                        <select
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        >
                            <option value="">Select Fuel Type</option>
                            {fuelPrices.map(fuel => (
                                <option key={fuel._id} value={fuel.fuelType}>
                                    {fuel.fuelType.charAt(0).toUpperCase() + fuel.fuelType.slice(1)} - ₹{fuel.pricePerLiter}/L
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Quantity (Liters) *
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            min="1"
                            step="0.01"
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Payment Method *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['upi', 'card', 'cash'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                    className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize flex flex-col items-center gap-1 transition ${formData.paymentMethod === method
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {method === 'card' && <CreditCard className="w-4 h-4" />}
                                    {method === 'upi' && <DollarSign className="w-4 h-4" />}
                                    {method === 'cash' && <DollarSign className="w-4 h-4" />}
                                    {method.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted rounded-lg p-6 space-y-3 border border-border">
                        <h3 className="font-semibold text-foreground">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price per Liter</span>
                                <span className="font-medium text-foreground">₹{pricePerLiter.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Quantity</span>
                                <span className="font-medium text-foreground">{formData.quantity || 0} L</span>
                            </div>
                            <div className="border-t border-border pt-2 flex justify-between items-center">
                                <span className="font-semibold text-foreground flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Total Amount
                                </span>
                                <span className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !formData.fuelType || !formData.quantity}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Creating Order...
                                </>
                            ) : (
                                <>
                                    <Fuel className="w-5 h-5" />
                                    {formData.paymentMethod === 'cash' ? 'Place Order' : 'Pay & Order'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/app/orders')}
                            className="px-6 py-3 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
