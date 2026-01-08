import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Fuel,
    Gift,
    Zap,
    Users,
    Star,
    ArrowRight,
    Check,
    CreditCard,
    TrendingUp,
    Shield,
    Menu,
    X,
    Calculator,
    Quote,
    Scan,
    QrCode,
    Wallet,
    Clock,
    Award,
    Smartphone
} from 'lucide-react';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

// Header Component
const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Testimonials', href: '#testimonials' }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1C1C1C]/95 backdrop-blur-lg border-b border-white/10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] text-white rounded-xl p-2">
                            <Fuel className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-white">FuelMate</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-300 hover:text-[#FF6F20] transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link to="/register">
                            <button className="px-5 py-2.5 bg-gradient-to-r from-[#FF6F20] to-[#FF8A4C] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-[#FF6F20]/25 transition-all">
                                Get Started Free
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden py-4 border-t border-white/10"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-gray-300 hover:text-[#FF6F20]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                <Link to="/login" className="text-sm font-medium text-gray-300">
                                    Login
                                </Link>
                                <Link to="/register" className="flex-1">
                                    <button className="w-full py-2.5 bg-gradient-to-r from-[#FF6F20] to-[#FF8A4C] text-white rounded-xl text-sm font-medium">
                                        Get Started Free
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>
        </header>
    );
};

// Hero Section
const HeroSection = () => {
    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#1C1C1C]">
            {/* Background Pattern */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6F20]/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF8A4C]/15 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6F20]/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6F20]/15 text-[#FF6F20] rounded-full text-sm font-medium mb-6 border border-[#FF6F20]/30">
                            <Zap className="w-4 h-4 fill-current" />
                            <span>Prepaid Fuel • Loyalty Rewards</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                            Buy Fuel Today,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F20] to-[#FF8A4C]">
                                Use Anytime
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                            Prepay for fuel at today's prices and collect it when convenient. Earn points on every purchase and redeem for discounts. The smarter way to fuel up!
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/register">
                                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6F20] to-[#FF8A4C] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6F20]/25 hover:shadow-xl hover:shadow-[#FF6F20]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                    Start Saving Now
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>

                            <a href="https://expo.dev/artifacts/eas/eSV5bx3VsK4QtcvyUvPVEw.apk">
                                <button className="w-full sm:w-auto px-8 py-4 bg-[#2D2D2D] text-white rounded-2xl font-semibold text-lg border border-white/10 hover:border-[#FF6F20]/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Smartphone className="w-5 h-5" />
                                    Download App
                                </button>
                            </a>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {['A', 'R', 'P', 'S'].map((i, idx) => (
                                        <div key={idx} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] border-2 border-[#1C1C1C] flex items-center justify-center text-white text-xs font-bold">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-400">
                                    <span className="font-bold text-white">2,500+</span> Happy Users
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                                <span className="text-sm text-gray-400 ml-1">4.9/5</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right - Hero Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative bg-gradient-to-br from-[#252525] to-[#1C1C1C] rounded-3xl p-8 border border-white/10 shadow-2xl">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6F20]/20 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF8A4C]/20 rounded-full blur-xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] rounded-2xl">
                                            <Fuel className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg text-white">FuelMate</span>
                                            <p className="text-xs text-gray-400">Prepaid Fuel Card</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Balance</p>
                                        <p className="text-xl font-bold text-[#FF6F20]">₹2,450</p>
                                    </div>
                                </div>

                                <div className="bg-[#2D2D2D] rounded-2xl p-6 mb-6 border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-400">Order Ready</p>
                                            <p className="text-2xl font-bold text-white mt-1">25 Liters</p>
                                            <p className="text-xs text-gray-500">Premium Petrol</p>
                                        </div>
                                        <div className="p-4 bg-[#1C1C1C] rounded-2xl">
                                            <QrCode className="w-12 h-12 text-[#FF6F20]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-green-400">
                                        <Check className="w-4 h-4" />
                                        <span>Scan at pump to collect</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#2D2D2D] rounded-xl p-3 text-center border border-white/5">
                                        <Award className="w-5 h-5 text-[#FF6F20] mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Points</p>
                                        <p className="text-sm font-bold text-white">1,250</p>
                                    </div>
                                    <div className="bg-[#2D2D2D] rounded-xl p-3 text-center border border-white/5">
                                        <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Saved</p>
                                        <p className="text-sm font-bold text-white">₹450</p>
                                    </div>
                                    <div className="bg-[#2D2D2D] rounded-xl p-3 text-center border border-white/5">
                                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1 fill-current" />
                                        <p className="text-xs text-gray-400">Tier</p>
                                        <p className="text-sm font-bold text-white">Gold</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-4 -left-4 bg-[#252525] rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-white/10"
                        >
                            <div className="p-2 bg-green-500/20 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Members Save</p>
                                <p className="font-bold text-white">Up to ₹500/mo</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Features Section
const FeaturesSection = () => {
    const features = [
        {
            icon: Wallet,
            title: 'Prepaid Fuel Orders',
            description: 'Buy fuel at today\'s prices and collect it whenever convenient. Lock in savings before price hikes.',
            color: 'from-[#FF6F20] to-[#FF8A4C]'
        },
        {
            icon: QrCode,
            title: 'QR Code Verification',
            description: 'Show your unique QR code at the pump. Quick, secure, and contactless fuel collection.',
            color: 'from-blue-500 to-blue-400'
        },
        {
            icon: Gift,
            title: 'Loyalty Rewards',
            description: 'Earn points on every purchase. Redeem for fuel discounts, free products, and exclusive offers.',
            color: 'from-green-500 to-green-400'
        },
        {
            icon: Users,
            title: 'Refer & Earn',
            description: 'Invite friends and earn 500 bonus points for each successful referral. Share the savings!',
            color: 'from-purple-500 to-purple-400'
        },
        {
            icon: Clock,
            title: 'Order Tracking',
            description: 'Track all your fuel orders in real-time. View order history and manage your fuel wallet.',
            color: 'from-yellow-500 to-yellow-400'
        },
        {
            icon: Shield,
            title: 'Secure Payments',
            description: 'Bank-grade security for all transactions. Your money and data are always protected.',
            color: 'from-red-500 to-red-400'
        }
    ];

    return (
        <section id="features" className="py-20 bg-[#1C1C1C]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6F20]/15 text-[#FF6F20] rounded-full text-sm font-medium mb-4">
                        <Zap className="w-4 h-4" />
                        Features
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Everything You Need to Save on Fuel
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
                        FuelMate combines prepaid fuel ordering with a powerful loyalty program to maximize your savings.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="bg-[#252525] border border-white/5 rounded-2xl p-6 hover:border-[#FF6F20]/30 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        {
            number: '01',
            title: 'Create Account',
            description: 'Sign up in less than 2 minutes. No credit card required to get started.',
            icon: Users
        },
        {
            number: '02',
            title: 'Buy Fuel Online',
            description: 'Select fuel type and quantity. Pay securely and lock in current prices.',
            icon: CreditCard
        },
        {
            number: '03',
            title: 'Get Your QR Code',
            description: 'Receive a unique QR code for your order. Valid until you collect your fuel.',
            icon: QrCode
        },
        {
            number: '04',
            title: 'Collect & Save',
            description: 'Show QR at the pump. Collect your fuel and earn loyalty points!',
            icon: Fuel
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-[#252525]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6F20]/15 text-[#FF6F20] rounded-full text-sm font-medium mb-4">
                        <Scan className="w-4 h-4" />
                        How It Works
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Simple Steps to Start Saving
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Get started in minutes and begin saving on every fuel purchase.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="relative text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#FF6F20]/20">
                                <step.icon className="w-9 h-9 text-white" />
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-[#1C1C1C] text-[#FF6F20] text-xs font-bold px-2 py-1 rounded-lg border border-[#FF6F20]/30">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-gray-400">{step.description}</p>

                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#FF6F20]/50 to-transparent"></div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// Pricing/Savings Section
const PricingSection = () => {
    const [monthlyFuel, setMonthlyFuel] = useState(5000);

    const calculateSavings = () => {
        const pointsEarned = Math.round(monthlyFuel * 0.02); // 2% points
        const annualSavings = pointsEarned * 12;
        return { pointsEarned, annualSavings };
    };

    const { pointsEarned, annualSavings } = calculateSavings();

    return (
        <section id="pricing" className="py-20 bg-[#1C1C1C] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6F20]/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6F20]/15 text-[#FF6F20] rounded-full text-sm font-medium mb-4">
                            <Calculator className="w-4 h-4" />
                            Savings Calculator
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            See How Much You Can Save
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Use the slider to estimate your annual savings based on your monthly fuel spend.
                        </p>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-400 mb-3">
                                Monthly Fuel Spend
                            </label>
                            <input
                                type="range"
                                min="1000"
                                max="25000"
                                step="500"
                                value={monthlyFuel}
                                onChange={(e) => setMonthlyFuel(Number(e.target.value))}
                                className="w-full h-2 bg-[#2D2D2D] rounded-full appearance-none cursor-pointer accent-[#FF6F20]"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-3">
                                <span>₹1,000</span>
                                <span className="text-white font-bold text-xl">₹{monthlyFuel.toLocaleString()}</span>
                                <span>₹25,000</span>
                            </div>
                        </div>

                        <Link to="/register">
                            <button className="px-8 py-4 bg-gradient-to-r from-[#FF6F20] to-[#FF8A4C] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6F20]/25 hover:shadow-xl transition-all flex items-center gap-2">
                                Start Saving Today
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Right Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#252525] rounded-3xl p-8 border border-white/10"
                    >
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Estimated Annual Savings
                            </p>
                            <div className="flex items-baseline justify-center gap-1 mb-6">
                                <span className="text-6xl font-bold text-[#FF6F20]">₹{annualSavings.toLocaleString()}</span>
                            </div>
                            <p className="text-gray-400 mb-8">
                                Based on monthly spending of ₹{monthlyFuel.toLocaleString()}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1C1C1C] rounded-2xl p-5 border border-white/5">
                                    <p className="text-sm text-gray-400 mb-1">Monthly Points</p>
                                    <p className="text-2xl font-bold text-white">{pointsEarned.toLocaleString()}</p>
                                </div>
                                <div className="bg-[#1C1C1C] rounded-2xl p-5 border border-white/5">
                                    <p className="text-sm text-gray-400 mb-1">Annual Points</p>
                                    <p className="text-2xl font-bold text-green-400">{(pointsEarned * 12).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Testimonials Section
const TestimonialsSection = () => {
    const testimonials = [
        {
            name: 'Rahul Sharma',
            role: 'Gold Member',
            avatar: 'RS',
            rating: 5,
            text: "FuelMate has completely changed how I buy fuel. I saved ₹3,000 last month alone just by prepaying during price dips!"
        },
        {
            name: 'Priya Patel',
            role: 'Platinum Member',
            avatar: 'PP',
            rating: 5,
            text: "The QR code system is so convenient. No more carrying cash or waiting for card machines. Just scan and go!"
        },
        {
            name: 'Amit Kumar',
            role: 'Gold Member',
            avatar: 'AK',
            rating: 5,
            text: "The referral program is amazing! I've earned over 5,000 bonus points just by inviting my friends and family."
        }
    ];

    return (
        <section id="testimonials" className="py-20 bg-[#252525]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6F20]/15 text-[#FF6F20] rounded-full text-sm font-medium mb-4">
                        <Users className="w-4 h-4" />
                        Testimonials
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Loved by Thousands of Drivers
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
                        See what our members have to say about their FuelMate experience.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="bg-[#1C1C1C] rounded-3xl p-8 relative border border-white/5"
                        >
                            <div className="absolute top-6 right-6 text-[#FF6F20]/20">
                                <Quote className="w-12 h-12 fill-current" />
                            </div>

                            <div className="flex text-yellow-400 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-6 leading-relaxed relative z-10">
                                "{testimonial.text}"
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] rounded-full flex items-center justify-center text-white font-bold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// CTA Section
const CTASection = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-[#FF6F20] to-[#E55A10] relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Start Saving on Fuel Today!
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Join thousands of smart drivers who are saving money with every fill-up. Sign up now and get started in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="px-10 py-4 bg-white text-[#FF6F20] rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                Create Free Account
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="px-10 py-4 bg-transparent text-white rounded-2xl font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>

                    <p className="text-sm text-white/70 mt-6">
                        No credit card required • Free forever • Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// Footer
const Footer = () => {
    const footerLinks = {
        Company: ['About Us', 'Careers', 'Press', 'Partners'],
        Support: ['Help Center', 'Contact Us', 'FAQ', 'Locations'],
        Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    };

    return (
        <footer className="bg-[#1C1C1C] text-white py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-gradient-to-br from-[#FF6F20] to-[#FF8A4C] text-white rounded-xl p-2">
                                <Fuel className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">FuelMate</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            The smarter way to fuel up. Prepay for fuel, earn rewards, and save money on every purchase.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-bold mb-4 text-white">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                        <a href="#" className="text-gray-400 hover:text-[#FF6F20] text-sm transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © 2024 FuelMate. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="text-gray-400 hover:text-[#FF6F20] transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                        </a>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="text-gray-400 hover:text-[#FF6F20] transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="text-gray-400 hover:text-[#FF6F20] transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Main Landing Page Component
const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#1C1C1C]">
            <Header />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <PricingSection />
                <TestimonialsSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
