import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users, Loader, Trash2, Eye, Search } from 'lucide-react';
import api from '../../services/api';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/customers');
            // Backend returns array directly
            setCustomers(Array.isArray(response.data) ? response.data : (response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const deleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            await api.delete(`/users/${id}`);
            setCustomers(prev => prev.filter(c => c._id !== id));
            toast.success('Customer deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete customer');
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-8 h-8 text-primary" />
                    Customer Management
                </h1>
                <p className="text-muted-foreground mt-1">Manage and monitor all customers</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Total Customers</p>
                    <p className="text-3xl font-bold text-primary mt-2">{customers.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">Active Today</p>
                    <p className="text-3xl font-bold text-green-500 mt-2">
                        {customers.filter(c => {
                            const lastActive = new Date(c.lastActive || c.createdAt);
                            const today = new Date();
                            return lastActive.toDateString() === today.toDateString();
                        }).length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted-foreground text-sm">New This Month</p>
                    <p className="text-3xl font-bold text-blue-500 mt-2">
                        {customers.filter(c => {
                            const created = new Date(c.createdAt);
                            const today = new Date();
                            return created.getMonth() === today.getMonth() &&
                                created.getFullYear() === today.getFullYear();
                        }).length}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Customers Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Orders</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer._id} className="border-b border-border hover:bg-muted transition">
                                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                                            {customer.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {customer.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                                {customer.ordersCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCustomer(customer._id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Delete customer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Customer Details</h2>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="text-2xl text-muted-foreground hover:text-foreground transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="text-lg font-semibold text-foreground">{selectedCustomer.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="text-foreground">{selectedCustomer.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="text-foreground">{selectedCustomer.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Joined</p>
                                <p className="text-foreground">{new Date(selectedCustomer.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-foreground font-semibold">{selectedCustomer.ordersCount || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Account Status</p>
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                                    Active
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    deleteCustomer(selectedCustomer._id);
                                    setSelectedCustomer(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                            >
                                Delete Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
