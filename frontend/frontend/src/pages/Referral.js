import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, transactionAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
    Gift,
    Copy,
    Check,
    Share2,
    Users,
    Coins,
    ArrowLeft,
    Loader2,
    Trophy,
    Sparkles,
    UserPlus,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Referral = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [referralTransactions, setReferralTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, transactionsRes] = await Promise.all([
                authAPI.getProfile(),
                transactionAPI.getMyTransactions()
            ]);

            setUser(profileRes.data);

            // Filter referral transactions
            const referrals = transactionsRes.data.filter(
                t => t.type === 'referral' || t.description?.toLowerCase().includes('referral')
            );
            setReferralTransactions(referrals);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load referral data');
        } finally {
            setLoading(false);
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

    const shareReferralCode = async () => {
        const shareText = `🚗 Join FuelMate and get rewarded for every fuel purchase!\n\nUse my referral code: ${user?.referralCode}\n\nSign up now and we both earn 500 bonus points! 🎁`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join FuelMate!',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyReferralCode();
                }
            }
        } else {
            copyReferralCode();
        }
    };

    const totalReferralEarnings = referralTransactions.reduce(
        (sum, t) => sum + (t.pointsEarned || 0), 0
    );

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
                    <h1 className="text-2xl font-bold">Refer & Earn</h1>
                    <p className="text-muted-foreground">Invite friends and earn rewards</p>
                </div>
            </div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-700 rounded-3xl p-8 text-white"
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Gift className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Earn 500 Points</h2>
                            <p className="text-white/80">For every successful referral!</p>
                        </div>
                    </div>

                    <p className="text-white/90 mb-6 max-w-md">
                        Share your unique referral code with friends. When they sign up and make their first purchase, you both earn bonus points!
                    </p>

                    {/* Referral Code Display */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                        <p className="text-sm text-white/70 mb-2">Your Referral Code</p>
                        <div className="flex items-center justify-between">
                            <code className="text-2xl font-mono font-bold tracking-wider">
                                {user?.referralCode || 'N/A'}
                            </code>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyReferralCode}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={shareReferralCode}
                                    className="p-3 bg-white hover:bg-white/90 text-primary rounded-xl transition"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={shareReferralCode}
                        className="w-full py-4 bg-white text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition shadow-lg"
                    >
                        <UserPlus className="w-5 h-5" /> Invite Friends Now
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Successful Referrals</p>
                            <p className="text-2xl font-bold">{referralTransactions.length}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Coins className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Points Earned</p>
                            <p className="text-2xl font-bold">{totalReferralEarnings}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl border border-border p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Reward Value</p>
                            <p className="text-2xl font-bold">₹{(totalReferralEarnings / 10).toFixed(0)}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* How It Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border p-6"
            >
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    How It Works
                </h3>

                <div className="grid gap-6 sm:grid-cols-3">
                    {[
                        {
                            step: '01',
                            title: 'Share Your Code',
                            description: 'Share your unique referral code with friends and family',
                            icon: Share2,
                            color: 'text-blue-500 bg-blue-500/20'
                        },
                        {
                            step: '02',
                            title: 'Friend Signs Up',
                            description: 'Your friend creates an account using your referral code',
                            icon: UserPlus,
                            color: 'text-green-500 bg-green-500/20'
                        },
                        {
                            step: '03',
                            title: 'Both Get Rewarded',
                            description: 'You earn 500 points! Your friend gets a welcome bonus',
                            icon: Gift,
                            color: 'text-primary bg-primary/20'
                        }
                    ].map((item, index) => (
                        <div key={index} className="relative">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground mb-2">STEP {item.step}</span>
                                <h4 className="font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            {index < 2 && (
                                <ChevronRight className="hidden sm:block absolute top-8 -right-3 w-6 h-6 text-muted-foreground/30" />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Referral History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
            >
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold">Referral History</h3>
                    <p className="text-sm text-muted-foreground">Track your referral rewards</p>
                </div>

                {referralTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-semibold mb-2">No Referrals Yet</h4>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Share your referral code with friends to start earning bonus points!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {referralTransactions.map((transaction, index) => (
                            <div
                                key={transaction._id || index}
                                className="p-4 flex items-center justify-between hover:bg-muted/50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{transaction.description || 'Referral Bonus'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-500">+{transaction.pointsEarned} pts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Referral;
