import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Car,
    Coins,
    Gift,
    Edit2,
    Save,
    X,
    Copy,
    Check,
    Share2,
    Shield,
    Star,
    ArrowLeft,
    Loader2,
    Eye,
    EyeOff,
    Download,
    Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    useAuth(); // For context only, user data is fetched from API
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleNumber: '',
        password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data);
            setFormData({
                name: response.data.name || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                vehicleNumber: response.data.vehicleNumber || '',
                password: ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleNumber: formData.vehicleNumber
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await authAPI.updateProfile(updateData);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify({
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                ...response.data
            }));
            toast.success('Profile updated successfully!');
            setEditing(false);
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const copyReferralCode = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            toast.success('Referral code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareReferralCode = () => {
        if (navigator.share && user?.referralCode) {
            navigator.share({
                title: 'Join FuelMate!',
                text: `Use my referral code ${user.referralCode} to sign up on FuelMate and get bonus points!`,
                url: window.location.origin
            });
        } else {
            copyReferralCode();
        }
    };

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
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-muted rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden"
                >
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{user?.name}</h2>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${user?.role === 'admin'
                                            ? 'bg-red-500/20 text-red-500'
                                            : 'bg-primary/20 text-primary'
                                            }`}>
                                            <Shield className="w-3 h-3 inline mr-1" />
                                            {user?.role?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditing(!editing)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium ${editing
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    }`}
                            >
                                {editing ? (
                                    <>
                                        <X className="w-4 h-4" /> Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-4 h-4" /> Edit Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Number */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Vehicle Number
                                </label>
                                <div className="relative">
                                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        value={formData.vehicleNumber}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        placeholder="e.g., MH01AB1234"
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Field (Only when editing) */}
                        <AnimatePresence>
                            {editing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 border-t border-border mt-4">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            New Password (leave blank to keep current)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Enter new password"
                                                className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Save Button */}
                        <AnimatePresence>
                            {editing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex justify-end pt-4"
                                >
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" /> Save Changes
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    {/* Points Card */}
                    {user?.role !== 'admin' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-6 text-white"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <Coins className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Available Points</p>
                                    <p className="text-3xl font-bold">{user?.availablePoints || 0}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                                <div>
                                    <p className="text-white/60 text-xs">Total Earned</p>
                                    <p className="text-lg font-semibold">{user?.totalPoints || 0}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xs">Redeemed</p>
                                    <p className="text-lg font-semibold">{user?.redeemedPoints || 0}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Referral Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-2xl border border-border p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Gift className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Refer & Earn</h3>
                                <p className="text-xs text-muted-foreground">Get 500 points per referral</p>
                            </div>
                        </div>

                        <div className="bg-background border border-border rounded-lg p-3 flex items-center justify-between mb-3">
                            <code className="text-sm font-mono font-bold text-primary">
                                {user?.referralCode || 'N/A'}
                            </code>
                            <button
                                onClick={copyReferralCode}
                                className="p-2 hover:bg-muted rounded-lg transition"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        </div>

                        <button
                            onClick={shareReferralCode}
                            className="w-full py-2 bg-green-500/20 text-green-500 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-500/30 transition"
                        >
                            <Share2 className="w-4 h-4" /> Share Code
                        </button>
                    </motion.div>

                    {/* Member Since */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card rounded-2xl border border-border p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <Star className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Member Since</p>
                                <p className="font-semibold">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })
                                        : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Download App Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card rounded-2xl border border-border p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Mobile App</h3>
                                <p className="text-xs text-muted-foreground">Download for Android</p>
                            </div>
                        </div>
                        <a
                            href="https://expo.dev/artifacts/eas/eSV5bx3VsK4QtcvyUvPVEw.apk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-emerald-500/20 text-emerald-500 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition"
                        >
                            <Download className="w-4 h-4" /> Download APK
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
