import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Fuel, Loader, Edit2, Check, X } from 'lucide-react';
import api from '../../services/api';

export default function FuelPrices() {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/fuel-prices');
            setPrices(Array.isArray(response.data) ? response.data : (response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch fuel prices');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (price) => {
        setEditingId(price._id);
        setEditValue(price.pricePerLiter.toString());
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const savePrice = async (id) => {
        if (!editValue || isNaN(parseFloat(editValue))) {
            toast.error('Please enter a valid price');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/fuel-prices/${id}`, { pricePerLiter: parseFloat(editValue) });
            toast.success('Price updated successfully');
            fetchPrices();
            setEditingId(null);
            setEditValue('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update price');
        } finally {
            setSaving(false);
        }
    };

    const getPercentageChange = (fuelType) => {
        // Mock data for price history - in real app, fetch from backend
        const changes = {
            'Petrol': 2.5,
            'Diesel': -1.2,
            'LPG': 0.8
        };
        return changes[fuelType] || 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Fuel className="w-8 h-8 text-primary" />
                    Fuel Prices Management
                </h1>
                <p className="text-muted-foreground mt-1">Update and manage fuel prices</p>
            </div>

            {/* Price Cards */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : prices.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <Fuel className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">No fuel prices configured</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prices.map(fuelPrice => {
                            const change = getPercentageChange(fuelPrice.fuelType);
                            const isUp = change > 0;

                            return (
                                <div
                                    key={fuelPrice._id}
                                    className="bg-card border border-border rounded-lg p-6 space-y-4"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {fuelPrice.fuelType}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Last updated: {new Date(fuelPrice.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isUp
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                            {isUp ? '↑' : '↓'} {Math.abs(change)}%
                                        </span>
                                    </div>

                                    {/* Price Display/Edit */}
                                    <div className="bg-muted rounded-lg p-4 border border-border">
                                        {editingId === fuelPrice._id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-muted-foreground">₹</span>
                                                <input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    step="0.01"
                                                    className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-2xl font-bold"
                                                    autoFocus
                                                />
                                                <span className="text-lg font-semibold text-muted-foreground">/L</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-bold text-primary">
                                                    ₹{fuelPrice.pricePerLiter.toFixed(2)}
                                                </span>
                                                <span className="text-lg font-semibold text-muted-foreground mb-1">/L</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {editingId === fuelPrice._id ? (
                                            <>
                                                <button
                                                    onClick={() => savePrice(fuelPrice._id)}
                                                    disabled={saving}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {saving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition font-medium"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(fuelPrice)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit Price
                                            </button>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-xs text-muted-foreground">
                                            ID: {fuelPrice._id.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Market Info Section */}
            <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Market Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Last Market Update</p>
                        <p className="text-2xl font-bold text-foreground mt-2">
                            {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Configured Fuels</p>
                        <p className="text-2xl font-bold text-primary mt-2">{prices.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Average Price</p>
                        <p className="text-2xl font-bold text-foreground mt-2">
                            ₹{(prices.reduce((sum, p) => sum + p.pricePerLiter, 0) / prices.length || 0).toFixed(2)}/L
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Price Update Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Update prices regularly to reflect market changes</li>
                        <li>• Ensure prices are competitive and profitable</li>
                        <li>• Notify customers of significant price changes</li>
                        <li>• Monitor market trends to adjust prices dynamically</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
