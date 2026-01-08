import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, Loader, Trash2, CheckSquare } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications/my');
            setNotifications(response.data.notifications || response.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === id ? { ...notif, read: true } : notif
                )
            );
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(notif => notif._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const getNotificationType = (type) => {
        const types = {
            order: { label: 'Order', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
            payment: { label: 'Payment', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            reward: { label: 'Reward', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
            system: { label: 'System', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
        };
        return types[type] || types.system;
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Bell className="w-8 h-8 text-primary" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">Stay updated with your orders and rewards</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                        <CheckSquare className="w-5 h-5" />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'unread', 'read'].map(status => (
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

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">No notifications</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(notification => {
                            const typeInfo = getNotificationType(notification.type);
                            return (
                                <div
                                    key={notification._id}
                                    className={`border border-border rounded-lg p-4 transition ${notification.read
                                            ? 'bg-card opacity-75'
                                            : 'bg-muted'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-foreground">
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-2 text-muted-foreground hover:text-primary transition"
                                                    title="Mark as read"
                                                >
                                                    <CheckSquare className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
