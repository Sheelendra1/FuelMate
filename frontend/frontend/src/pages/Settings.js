import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Moon,
    Sun,
    Bell,
    Globe,
    HelpCircle,
    FileText,
    LogOut,
    ChevronRight,
    ArrowLeft,
    Smartphone,
    Mail,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        promotions: false
    });

    useEffect(() => {
        // Check current theme
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);

        // Load notification preferences from localStorage
        const savedNotifications = localStorage.getItem('notificationPreferences');
        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        toast.success(`${newMode ? 'Dark' : 'Light'} mode enabled`);
    };

    const toggleNotification = (key) => {
        const newPrefs = { ...notifications, [key]: !notifications[key] };
        setNotifications(newPrefs);
        localStorage.setItem('notificationPreferences', JSON.stringify(newPrefs));
        toast.success('Preferences updated');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const settingsSections = [
        {
            title: 'Appearance',
            items: [
                {
                    icon: isDarkMode ? Moon : Sun,
                    label: 'Dark Mode',
                    description: 'Toggle between light and dark themes',
                    action: 'toggle',
                    value: isDarkMode,
                    onToggle: toggleDarkMode,
                    iconColor: isDarkMode ? 'text-purple-500 bg-purple-500/20' : 'text-yellow-500 bg-yellow-500/20'
                }
            ]
        },
        {
            title: 'Notifications',
            items: [
                {
                    icon: Bell,
                    label: 'Push Notifications',
                    description: 'Receive alerts for orders and updates',
                    action: 'toggle',
                    value: notifications.push,
                    onToggle: () => toggleNotification('push'),
                    iconColor: 'text-blue-500 bg-blue-500/20'
                },
                {
                    icon: Mail,
                    label: 'Email Notifications',
                    description: 'Get updates via email',
                    action: 'toggle',
                    value: notifications.email,
                    onToggle: () => toggleNotification('email'),
                    iconColor: 'text-green-500 bg-green-500/20'
                },
                {
                    icon: Smartphone,
                    label: 'Promotional Messages',
                    description: 'Receive offers and promotions',
                    action: 'toggle',
                    value: notifications.promotions,
                    onToggle: () => toggleNotification('promotions'),
                    iconColor: 'text-primary bg-primary/20'
                }
            ]
        },

        {
            title: 'Support',
            items: [
                ...(user?.role !== 'admin' ? [{
                    icon: HelpCircle,
                    label: 'Help Center',
                    description: 'Get help with your account',
                    action: 'navigate',
                    navigateTo: '/app/support',
                    iconColor: 'text-cyan-500 bg-cyan-500/20'
                }] : []),
                {
                    icon: FileText,
                    label: 'Terms of Service',
                    description: 'Read our terms and conditions',
                    action: 'navigate',
                    navigateTo: '/app/terms',
                    iconColor: 'text-gray-500 bg-gray-500/20'
                },
                {
                    icon: Globe,
                    label: 'Privacy Policy',
                    description: 'Learn about data handling',
                    action: 'navigate',
                    navigateTo: '/app/privacy',
                    iconColor: 'text-teal-500 bg-teal-500/20'
                },
                {
                    icon: Smartphone,
                    label: 'Get Mobile App',
                    description: 'Download FuelMate for Android',
                    action: 'link',
                    href: 'https://expo.dev/artifacts/eas/eSV5bx3VsK4QtcvyUvPVEw.apk',
                    iconColor: 'text-orange-500 bg-orange-500/20'
                }
            ]
        }
    ];

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-muted rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your preferences</p>
                </div>
            </div>

            {/* User Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${user?.role === 'admin'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-primary/20 text-primary'
                            }`}>
                            {user?.role?.toUpperCase()}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/app/profile')}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            </motion.div>

            {/* Settings Sections */}
            {settingsSections.map((section, sectionIndex) => (
                <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {section.title}
                        </h3>
                    </div>
                    <div className="divide-y divide-border">
                        {section.items.map((item, itemIndex) => (
                            <div
                                key={itemIndex}
                                className={`px-6 py-4 flex items-center justify-between ${item.action === 'navigate' || item.action === 'link'
                                    ? 'cursor-pointer hover:bg-muted/50 transition'
                                    : ''
                                    }`}
                                onClick={() => {
                                    if (item.action === 'navigate') {
                                        navigate(item.navigateTo);
                                    } else if (item.action === 'link') {
                                        window.open(item.href, '_blank');
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>

                                {item.action === 'toggle' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            item.onToggle();
                                        }}
                                        className={`relative w-12 h-7 rounded-full transition-colors ${item.value ? 'bg-primary' : 'bg-muted'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                )}

                                {(item.action === 'navigate' || item.action === 'link') && (
                                    <div className="text-muted-foreground">
                                        {item.action === 'link' ? (
                                            <ExternalLink className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5" />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Logout Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-medium flex items-center justify-center gap-2 transition border border-red-500/20"
                >
                    <LogOut className="w-5 h-5" /> Sign Out
                </button>
            </motion.div>

            {/* App Version */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center pb-6"
            >
                <p className="text-xs text-muted-foreground">
                    FuelMate Web v1.0.0
                </p>
            </motion.div>
        </div>
    );
};

export default Settings;
