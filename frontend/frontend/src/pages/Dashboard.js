import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, userAPI, fuelPriceAPI, orderAPI, supportAPI } from '../services/api';
import {
    TrendingUp,
    ShoppingCart,
    CheckCircle,
    Zap,
    Flame,
    User,
    Plus,
    FileText,
    UserPlus,
    Edit2,
    MoreHorizontal,
    MessageSquare,
    AlertCircle,
    IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    const { user } = useAuth();
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalTransactions: 0,
        recentTransactions: [],
        recentCustomers: [],
        myTransactions: [],
        myPoints: 0,
        myTotalPoints: 0,
        fuelPrices: [],
        totalPointsDistributed: 0,
        transactionsToday: 0,
        newCustomersToday: 0,
        weeklyData: { labels: [], data: [] },
        recentTickets: [],
        revenueToday: 0
    });

    const [editPriceId, setEditPriceId] = useState(null);
    const [editPriceValue, setEditPriceValue] = useState('');


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            if (user?.role === 'admin') {
                // Fetch critical data first
                const [customersRes, ordersRes, fuelPricesRes, ticketsRes] = await Promise.all([
                    userAPI.getCustomers(),
                    orderAPI.getAllOrders({ limit: 1000 }), // Get enough orders for stats
                    fuelPriceAPI.getFuelPrices(),
                    supportAPI.getAllTickets()
                ]);

                const orders = ordersRes.data.orders || [];
                const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];

                // Calculate detailed stats
                const totalPoints = orders.reduce((acc, o) => acc + (o.pointsEarned || 0), 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today && o.status !== 'cancelled');
                const txToday = todaysOrders.length;
                const revenueToday = todaysOrders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);

                // Calculate Weekly Sales (Last 7 Days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const chartLabels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
                const chartDataPoints = last7Days.map(date => {
                    const dayStart = new Date(date);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(date);
                    dayEnd.setHours(23, 59, 59, 999);

                    return orders.filter(o => {
                        const oDate = new Date(o.createdAt);
                        return oDate >= dayStart && oDate <= dayEnd && o.status !== 'cancelled';
                    }).reduce((sum, o) => sum + (o.liters || 0), 0);
                });

                setStats({
                    totalCustomers: customersRes.data.length,
                    totalTransactions: ordersRes.data.total || orders.length,
                    recentTransactions: orders.slice(0, 5),
                    recentCustomers: customersRes.data.slice(0, 5),
                    fuelPrices: fuelPricesRes.data,
                    totalPointsDistributed: totalPoints,
                    transactionsToday: txToday,
                    newCustomersToday: customersRes.data.filter(c => new Date(c.createdAt) >= today).length || 0,
                    weeklyData: { labels: chartLabels, data: chartDataPoints },
                    recentTickets: tickets.slice(0, 3),
                    revenueToday
                });
            } else {
                // Customer View
                const [transactionsRes, fuelPricesRes] = await Promise.all([
                    transactionAPI.getMyTransactions(),
                    fuelPriceAPI.getFuelPrices()
                ]);

                const totalEarned = transactionsRes.data.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);

                setStats({
                    myTransactions: transactionsRes.data,
                    myPoints: user?.availablePoints || 0,
                    myTotalPoints: totalEarned || user?.totalPoints || 0,
                    fuelPrices: fuelPricesRes.data
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);


    const renderAdminView = () => {
        // Handling Fuel Price Edit
        const handleEditPrice = (price) => {
            setEditPriceId(price._id);
            setEditPriceValue(price.pricePerLiter);
        };

        const handleSavePrice = async (id) => {
            // Validation
            if (editPriceValue === '' || editPriceValue === null) {
                setEditPriceId(null);
                return;
            }

            const price = parseFloat(editPriceValue);
            if (isNaN(price)) {
                toast.error("Please enter a valid price");
                return;
            }

            try {
                await fuelPriceAPI.updateFuelPrice(id, { pricePerLiter: price });
                toast.success("Price updated successfully");
                setEditPriceId(null);
                fetchData(); // Refresh data from backend
            } catch (error) {
                console.error("Update failed:", error);
                toast.error(error.response?.data?.message || "Failed to update price");
            }
        };

        // Chart Data
        // Chart Data
        const barData = {
            labels: stats.weeklyData?.labels?.length ? stats.weeklyData.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: stats.weeklyData?.data?.length ? stats.weeklyData.data : [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, '#f97316'); // Orange-500
                    gradient.addColorStop(1, '#fdba74'); // Orange-300
                    return gradient;
                },
                hoverBackgroundColor: '#ea580c', // Orange-600
                borderRadius: 8,
                barThickness: 40,
            }]
        };
        const barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, grid: { display: false } }, // Clean look
                x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
            }
        };

        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm">Welcome back, here's what's happening today.</p>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Today's Revenue", value: `₹${stats.revenueToday.toLocaleString()}`, icon: IndianRupee, gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", trend: "+12%" },
                        { label: "Transactions Today", value: stats.transactionsToday, icon: FileText, gradient: "bg-gradient-to-br from-orange-500 to-red-600", trend: "0%" },
                        { label: "New Customers", value: stats.newCustomersToday > 0 ? stats.newCustomersToday : stats.totalCustomers, icon: UserPlus, gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", trend: "+5%" }
                    ].map((item, idx) => (
                        <div key={idx} className={`${item.gradient} p-6 rounded-[1.5rem] shadow-lg text-white flex flex-col justify-between h-[160px] transition-transform hover:scale-[1.02] duration-300`}>
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                                    {item.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium mb-1">{item.label}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{item.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section (Span 2) */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[1.5rem] shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Station Performance Overview</h3>
                                <p className="text-sm text-slate-500">Weekly fuel sales volume across all stations</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Sales</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Goal</div>
                                <select className="bg-slate-50 border-none rounded-lg text-sm text-slate-600 font-medium px-3 py-1 focus:ring-0 cursor-pointer">
                                    <option>Last 7 Days</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>

                    {/* Fuel Prices Widget */}
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-slate-900">Fuel Prices</h3>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Updated recently</p>
                            </div>
                            <button
                                onClick={() => stats.fuelPrices.length > 0 && handleEditPrice(stats.fuelPrices[0])}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {stats.fuelPrices.map((price) => (
                                <div key={price._id} className="p-4 bg-[#F8F9FA] rounded-[1.25rem] border border-transparent hover:border-slate-100 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-800 text-sm tracking-wide">{price.fuelType === 'petrol' ? 'Petrol' : price.fuelType === 'diesel' ? 'Diesel' : 'CNG'}</span>
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", price.fuelType === 'petrol' ? 'text-red-500 bg-red-50' : price.fuelType === 'cng' ? 'text-green-500 bg-green-50' : 'text-slate-500 bg-slate-200')}>
                                            {price.fuelType === 'petrol' ? '-0.5%' : price.fuelType === 'cng' ? '+1.2%' : '0.0%'}
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-1">
                                        <div className="flex justify-between items-end w-full cursor-pointer group" onClick={() => handleEditPrice(price)}>
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-bold text-slate-900">₹{price.pricePerLiter}</span>
                                                <span className="text-xs text-slate-400 mb-1">{price.fuelType === 'cng' ? '/kg' : '/L'}</span>
                                            </div>
                                            <Edit2 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1" />
                                        </div>
                                        {/* Trend Line Mock */}
                                        <div className="w-12 h-6 ml-auto opacity-50">
                                            <svg viewBox="0 0 50 25" fill="none" className={cn("w-full h-full", price.fuelType === 'petrol' ? 'text-red-400' : 'text-green-400')}>
                                                <path d={price.fuelType === 'petrol' ? "M0 20 C10 20 15 5 25 15 S 40 20 50 5" : "M0 20 C10 15 20 20 30 15 S 40 5 50 2"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Price Modal */}
                {editPriceId && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Fuel Price</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-500 font-medium mb-1">New Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editPriceValue}
                                        onChange={(e) => setEditPriceValue(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setEditPriceId(null)}
                                        className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSavePrice(editPriceId)}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                    >
                                        Update Price
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Loyal Customers */}
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Loyal Customers</h3>
                            <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
                        </div>
                        <div className="space-y-6">
                            {stats.recentCustomers.map((customer, i) => (
                                <div key={customer._id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                                        {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800">{(customer.totalPoints || 0) > 0 ? (customer.totalPoints / 1000).toFixed(1) + 'k' : '0'} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Support Tickets */}
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Latest Tickets</h3>
                            <button onClick={() => navigate('/app/admin/support')} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {stats.recentTickets.length > 0 ? (
                                stats.recentTickets.map((ticket, i) => (
                                    <div key={ticket._id} className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${ticket.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {ticket.status === 'open' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{ticket.subject}</h4>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {ticket.user?.name || 'Unknown User'} • <span className="capitalize">{ticket.priority}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-sm">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No tickets found
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        );
    };

    // --- CUSTOMER VIEW (Target Design - Kept as is from previous step) ---
    const renderCustomerView = () => {
        // Derived Data
        const totalTransactions = stats.myTransactions.length;
        const totalSpent = stats.myTransactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        // Tier Logic
        const currentPoints = stats.myTotalPoints;
        const tiers = [
            { name: 'Silver', min: 0, color: 'text-slate-400' },
            { name: 'Gold', min: 1000, color: 'text-yellow-500' },
            { name: 'Platinum', min: 2500, color: 'text-indigo-400' }
        ];
        let currentTierIdx = 0;
        for (let i = 0; i < tiers.length; i++) {
            if (currentPoints >= tiers[i].min) currentTierIdx = i;
        }
        const currentTier = tiers[currentTierIdx];
        const nextTier = tiers[currentTierIdx + 1];
        const pointsToNext = nextTier ? nextTier.min - currentPoints : 0;
        const progress = nextTier
            ? ((currentPoints - tiers[currentTierIdx].min) / (nextTier.min - tiers[currentTierIdx].min)) * 100
            : 100;

        // Chart Data (Mocking monthly data for now or grouping transactions)
        const chartData = {
            labels: ['Jun 15', 'Jun 22', 'Jun 29', 'Jul 05', 'Jul 12'],
            datasets: [{
                label: 'Fuel Consumed (L)',
                data: [25, 30, 0, 45, 50], // Mock data as we don't have historical daily breakdown ready
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, '#f97316');
                    gradient.addColorStop(1, '#fdba74');
                    return gradient;
                },
                hoverBackgroundColor: '#ea580c',
                borderRadius: 8,
                barThickness: 20,
            }]
        };
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, grid: { display: false } },
                x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } } }
            }
        };

        const copyReferral = () => {
            const code = user?.referralCode || `FUEL-${user?._id?.slice(-4).toUpperCase()}`;
            navigator.clipboard.writeText(code);
            toast.success("Referral code copied!");
        };

        return (
            <div className="space-y-6">
                {/* Top Grade Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Tier Card - Orange/Red Theme Gradient (Spans 2) */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden flex flex-col justify-between h-[220px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                    <span className="p-1 bg-white/20 rounded-full"><User className="w-3 h-3" /></span>
                                    Current Tier
                                </div>
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold mb-1">{currentTier.name}</h2>
                        </div>

                        <div className="relative z-10 w-full">
                            <div className="flex justify-between text-xs font-medium text-white/80 mb-2">
                                <span>{currentTier.name}</span>
                                <span>{nextTier ? nextTier.name : 'Max Tier'}</span>
                            </div>
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-bold">{stats.myTotalPoints} pts</span>
                                {nextTier && <span className="text-xs text-white/70 mb-1">{pointsToNext} pts to go</span>}
                            </div>
                        </div>
                    </div>

                    {/* Total Earned - Emerald Gradient */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 shadow-xl shadow-emerald-200 flex flex-col justify-between h-[220px] text-white">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/20 text-white rounded-2xl">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <span className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-lg">+12 pts</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium mb-1">Total Earned</p>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-3xl font-bold">{stats.myTotalPoints.toLocaleString()}</h3>
                                <span className="text-sm text-white/60 font-medium">pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Count - Blue Gradient */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 shadow-xl shadow-blue-200 flex flex-col justify-between h-[220px] text-white">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/20 text-white rounded-2xl">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium mb-1">Total Transactions</p>
                            <h3 className="text-3xl font-bold">{totalTransactions}</h3>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Tracker + Refer + Rates */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Fuel Efficiency Tracker (Span 2) */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-full h-fit"><CheckCircle className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Fuel Efficiency Tracker</h3>
                                    <p className="text-sm text-slate-500">Track your mileage and spending trends.</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                                <Plus className="w-4 h-4" /> Log Fill-up
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] bg-white w-fit px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider mb-2">AVG. MILEAGE</p>
                                <p className="text-2xl font-bold text-slate-800">14.2 <span className="text-xs text-slate-400 font-normal">km/L</span></p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-1">
                                    <TrendingUp className="w-3 h-3" /> +0.4 km/L
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] bg-white w-fit px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider mb-2">TOTAL SPENT (JUL)</p>
                                <p className="text-2xl font-bold text-slate-800">₹{totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] bg-white w-fit px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider mb-2">FUEL CONSUMED</p>
                                <p className="text-2xl font-bold text-slate-800">42.5 <span className="text-xs text-slate-400 font-normal">L</span></p>
                            </div>
                        </div>

                        <div className="h-[180px] w-full">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Refer & Earn (Span 1) */}
                    <div className="bg-[#6366f1] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <h3 className="text-xl font-bold mb-2">Refer & Earn</h3>
                        <p className="text-indigo-100 text-sm mb-6">Get <span className="font-bold text-white">500 Bonus Points</span> for every friend who joins.</p>

                        <div className="bg-white/10 p-1.5 rounded-xl flex items-center justify-between pl-4 backdrop-blur-sm border border-white/10">
                            <div className="text-xs">
                                <p className="text-indigo-200">Your Code</p>
                                <p className="font-mono font-bold tracking-wider">{user?.referralCode || `FUEL-${user?._id?.slice(-4).toUpperCase()}`}</p>
                            </div>
                            <button onClick={copyReferral} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                                COPY
                            </button>
                        </div>
                    </div>

                    {/* Today's Rates (Span 1) */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-800">Today's Rates</h3>
                            </div>
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">LIVE</span>
                        </div>

                        <div className="space-y-4">
                            {stats.fuelPrices.map((price) => (
                                <div key={price._id} className="p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{price.fuelType}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                            <TrendingUp className="w-3 h-3" /> +0.5%
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-1">
                                        <span className="text-xl font-bold text-slate-800">₹{price.pricePerLiter}</span>
                                        <span className="text-xs text-slate-400 mb-1">/L</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        );
    };

    return (
        <div className="min-h-screen">
            {user?.role === 'admin' ? renderAdminView() : renderCustomerView()}
        </div>
    );
};

export default Dashboard;
