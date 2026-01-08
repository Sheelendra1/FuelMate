import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    ChevronRight,
    User,
    Mail,
    Phone,
    Send,
    Loader2,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminSupport = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTickets = useCallback(async () => {
        try {
            const response = await supportAPI.getAllTickets(statusFilter || undefined);
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleSelectTicket = async (ticket) => {
        try {
            const response = await supportAPI.getTicketById(ticket._id);
            setSelectedTicket(response.data);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            toast.error('Failed to load ticket details');
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return;

        setSending(true);
        try {
            const response = await supportAPI.replyToTicket(selectedTicket._id, {
                message: replyMessage
            });
            setSelectedTicket(response.data.ticket);
            setReplyMessage('');
            fetchTickets();
            toast.success('Reply sent successfully');
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleStatusUpdate = async (ticketId, status) => {
        try {
            await supportAPI.updateTicketStatus(ticketId, status);
            fetchTickets();
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket(prev => ({ ...prev, status }));
            }
            toast.success(`Ticket marked as ${status}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-yellow-500/20 text-yellow-500';
            case 'in-progress':
                return 'bg-blue-500/20 text-blue-500';
            case 'resolved':
                return 'bg-green-500/20 text-green-500';
            case 'closed':
                return 'bg-gray-500/20 text-gray-500';
            default:
                return 'bg-gray-500/20 text-gray-500';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500/20 text-red-500';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-500';
            case 'low':
                return 'bg-green-500/20 text-green-500';
            default:
                return 'bg-gray-500/20 text-gray-500';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            ticket.subject?.toLowerCase().includes(query) ||
            ticket.user?.name?.toLowerCase().includes(query) ||
            ticket.user?.email?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Support Tickets</h1>
                        <p className="text-muted-foreground">Manage customer support requests</p>
                    </div>
                </div>
                <button
                    onClick={fetchTickets}
                    className="p-2 hover:bg-muted rounded-lg transition"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
                {[
                    { label: 'Open', count: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/20' },
                    { label: 'In Progress', count: tickets.filter(t => t.status === 'in-progress').length, icon: Clock, color: 'text-blue-500 bg-blue-500/20' },
                    { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: 'text-green-500 bg-green-500/20' },
                    { label: 'Closed', count: tickets.filter(t => t.status === 'closed').length, icon: XCircle, color: 'text-gray-500 bg-gray-500/20' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-xl border border-border p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.count}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by subject or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tickets List */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-semibold">Tickets ({filteredTickets.length})</h2>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
                        {filteredTickets.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No tickets found</p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => handleSelectTicket(ticket)}
                                    className={`p-4 cursor-pointer hover:bg-muted/50 transition ${selectedTicket?._id === ticket._id ? 'bg-muted' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{ticket.subject}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {ticket.user?.name || 'Unknown User'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    {selectedTicket ? (
                        <>
                            {/* Ticket Header */}
                            <div className="p-4 border-b border-border">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-semibold">{selectedTicket.subject}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Ticket #{selectedTicket._id?.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getStatusColor(selectedTicket.status)}`}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                {/* Customer Info */}
                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedTicket.user?.name}</p>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {selectedTicket.user?.email}
                                                </span>
                                                {selectedTicket.user?.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {selectedTicket.user?.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
                                {/* Original Message */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{selectedTicket.user?.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(selectedTicket.createdAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm bg-muted p-3 rounded-lg rounded-tl-none">
                                            {selectedTicket.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.replies?.map((reply, index) => (
                                    <div key={index} className={`flex gap-3 ${reply.isAdmin ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${reply.isAdmin ? 'bg-primary/20' : 'bg-blue-500/20'
                                            }`}>
                                            <User className={`w-4 h-4 ${reply.isAdmin ? 'text-primary' : 'text-blue-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`flex items-center gap-2 ${reply.isAdmin ? 'justify-end' : ''}`}>
                                                <span className="font-medium text-sm">
                                                    {reply.isAdmin ? 'Admin' : reply.user?.name || 'Customer'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            <p className={`mt-1 text-sm p-3 rounded-lg ${reply.isAdmin
                                                ? 'bg-primary text-primary-foreground rounded-tr-none ml-auto'
                                                : 'bg-muted rounded-tl-none'
                                                }`}>
                                                {reply.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            {selectedTicket.status !== 'closed' && (
                                <div className="p-4 border-t border-border">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                            onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                        />
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyMessage.trim() || sending}
                                            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Select a Ticket</h3>
                            <p className="text-muted-foreground text-sm">
                                Click on a ticket to view details and reply
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
