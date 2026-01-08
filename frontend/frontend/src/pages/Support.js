import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, MessageSquare, Loader, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supportAPI } from '../services/api';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        category: 'general'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await supportAPI.getMyTickets();
            // Backend probably returns array directly or inside data property
            setTickets(response.data.tickets || response.data.data || response.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setSubmitting(true);
            await supportAPI.createTicket(formData);
            toast.success('Support ticket created successfully!');
            setFormData({ subject: '', message: '', category: 'general' });
            setShowForm(false);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved':
                return <CheckCircle className="w-4 h-4" />;
            case 'in-progress':
                return <Clock className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        Help & Support
                    </h1>
                    <p className="text-muted-foreground mt-1">Get help with your issues or questions</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                        <Plus className="w-5 h-5" />
                        New Ticket
                    </button>
                )}
            </div>

            {/* Create Ticket Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground">Create Support Ticket</h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-muted-foreground hover:text-foreground transition"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="general">General Inquiry</option>
                                <option value="payment">Payment Issue</option>
                                <option value="delivery">Delivery Issue</option>
                                <option value="order">Order Issue</option>
                                <option value="account">Account Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief description of your issue"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Message *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Provide details about your issue..."
                                rows="5"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tickets List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">No support tickets</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                        >
                            Create Your First Ticket
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map(ticket => (
                            <div
                                key={ticket._id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {ticket.subject}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Ticket ID: {ticket._id.substring(0, 8)}...
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                    </span>
                                </div>

                                <p className="text-foreground text-sm mb-4 line-clamp-2">
                                    {ticket.message || ticket.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="bg-muted px-2 py-1 rounded">
                                            {ticket.category?.charAt(0).toUpperCase() + ticket.category?.slice(1) || 'General'}
                                        </span>
                                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className="text-primary hover:text-primary/80 font-medium text-sm transition">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAQ Section */}
            <div className="bg-card border border-border rounded-lg p-8 mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        {
                            q: "How do I place an order?",
                            a: "Go to the Orders section and click 'New Order'. Select fuel type, quantity, and delivery location, then proceed to payment."
                        },
                        {
                            q: "What payment methods do you accept?",
                            a: "We accept all major credit/debit cards, digital wallets, and net banking options."
                        },
                        {
                            q: "How long does delivery take?",
                            a: "Delivery typically takes 24-48 hours from the time of order confirmation."
                        },
                        {
                            q: "Can I cancel my order?",
                            a: "Yes, you can cancel pending orders. Completed orders cannot be cancelled but can be refunded."
                        },
                        {
                            q: "How do the rewards work?",
                            a: "Every purchase earns you points. You can redeem these points for discounts on future orders."
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                            <p className="font-semibold text-foreground mb-2">{item.q}</p>
                            <p className="text-muted-foreground">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
