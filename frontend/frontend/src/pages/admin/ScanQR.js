import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode,
    CheckCircle,
    XCircle,
    Loader,
    Package,
    AlertTriangle,
    Search,
    Camera,
    Image,
    SwitchCamera,
    X,
    Scan,
    Upload
} from 'lucide-react';

export default function ScanQR() {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [manualId, setManualId] = useState('');
    const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'

    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const isScanning = useRef(false);

    // Stop scanner - defined first so it can be used by verifyOrder
    const stopScanner = useCallback(async () => {
        if (scannerRef.current && isScanning.current) {
            try {
                isScanning.current = false;
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                // Ignore errors when stopping - scanner might already be stopped
                console.log('Scanner stop:', err.message);
            }
            scannerRef.current = null;
        }
        setScannerActive(false);
    }, []);

    // Verify order function
    const verifyOrder = useCallback(async (qrData) => {
        if (!qrData) return;

        try {
            setLoading(true);
            console.log('Verifying QR Data:', qrData);

            const response = await api.post('/orders/verify', { qrData });
            setScanResult(response.data);

            if (response.data.valid) {
                toast.success('Order verified successfully');
                stopScanner();
            } else if (response.data.success) {
                toast.error(response.data.message || 'Order found but not valid for completion');
                stopScanner();
            }
        } catch (error) {
            console.error('Verification error:', error);
            const msg = error.response?.data?.message || 'Failed to verify QR code';
            toast.error(msg);
            setScanResult({ error: true, message: msg });
        } finally {
            setLoading(false);
        }
    }, [stopScanner]);

    // Initialize scanner when scannerActive becomes true
    useEffect(() => {
        if (!scannerActive || cameraPermission !== 'granted') return;

        let html5QrCode = null;
        let mounted = true;

        const initScanner = async () => {
            // Wait longer for DOM to be ready after AnimatePresence
            await new Promise(resolve => setTimeout(resolve, 500));

            const element = document.getElementById('qr-reader');
            if (!element || !mounted) return;

            try {
                html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        verifyOrder(decodedText);
                    },
                    () => { }
                );
                // Mark as scanning after successful start
                isScanning.current = true;
            } catch (err) {
                console.error('Scanner start error:', err);
                if (mounted) {
                    toast.error('Failed to start camera');
                    setScannerActive(false);
                }
            }
        };

        initScanner();

        return () => {
            mounted = false;
            if (html5QrCode && isScanning.current) {
                isScanning.current = false;
                html5QrCode.stop().catch(() => { });
            }
        };
    }, [scannerActive, cameraPermission, facingMode, verifyOrder]);

    // Request camera permission and activate scanner
    const startScanner = async () => {
        try {
            // Request camera permission first
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission('granted');
            setScannerActive(true);
        } catch (error) {
            console.error('Permission error:', error);
            setCameraPermission('denied');
            toast.error('Camera permission denied');
        }
    };

    // Switch camera
    const switchCamera = async () => {
        const newFacing = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newFacing);

        if (scannerRef.current && scannerActive) {
            await stopScanner();
            setTimeout(() => {
                startScanner();
            }, 300);
        }
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);

            const html5QrCode = new Html5Qrcode("qr-file-reader");

            const result = await html5QrCode.scanFile(file, true);
            verifyOrder(result);
        } catch (error) {
            console.error('File scan error:', error);
            toast.error('No QR code found in image');
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        verifyOrder(manualId.trim());
    };

    const resetScanner = () => {
        setScanResult(null);
        setManualId('');
        setCameraPermission('prompt');
    };

    const completeOrder = async () => {
        if (!scanResult?.order?.orderId) return;

        try {
            setActionLoading(true);
            await api.put(`/orders/${scanResult.order.orderId}/complete`);
            toast.success('Order completed successfully!');
            setTimeout(resetScanner, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                        <QrCode className="w-7 h-7 text-primary" />
                    </div>
                    Scan QR Code
                </h1>
                <p className="text-muted-foreground mt-2">Scan customer order QR code or enter Order ID manually</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Scanner Section */}
                <div className="space-y-4">
                    {/* Scanner Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 min-h-[450px] flex flex-col relative overflow-hidden"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Hidden reader for file scanning */}
                        <div id="qr-file-reader" className="hidden"></div>

                        <AnimatePresence mode="wait">
                            {/* Initial State - Request Permission */}
                            {!scannerActive && !scanResult && cameraPermission === 'prompt' && (
                                <motion.div
                                    key="prompt"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center relative z-10"
                                >
                                    {/* Animated QR Icon */}
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-24 h-24 bg-gradient-to-br from-primary to-orange-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
                                    >
                                        <Scan className="w-12 h-12 text-white" />
                                    </motion.div>

                                    <h3 className="text-xl font-bold text-white mb-2">Ready to Scan</h3>
                                    <p className="text-slate-400 text-sm mb-8 max-w-xs">
                                        Choose how you want to scan the customer's QR code
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                                        <button
                                            onClick={startScanner}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                                        >
                                            <Camera className="w-5 h-5" />
                                            Use Camera
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Upload
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Camera Permission Denied */}
                            {cameraPermission === 'denied' && !scanResult && !scannerActive && (
                                <motion.div
                                    key="denied"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center relative z-10"
                                >
                                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                        <XCircle className="w-10 h-10 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Camera Access Denied</h3>
                                    <p className="text-slate-400 text-sm mb-6 max-w-xs">
                                        Please allow camera access in your browser settings or upload an image instead
                                    </p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="py-3 px-6 bg-white/10 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <Image className="w-5 h-5" />
                                        Upload from Gallery
                                    </button>
                                </motion.div>
                            )}

                            {/* Active Scanner */}
                            {scannerActive && cameraPermission === 'granted' && (
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col relative z-10"
                                >
                                    {/* Scanner Controls */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm text-green-400 font-medium">Scanning...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={switchCamera}
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-white"
                                                title="Switch Camera"
                                            >
                                                <SwitchCamera className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-white"
                                                title="Upload Image"
                                            >
                                                <Image className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={stopScanner}
                                                className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition text-red-400"
                                                title="Stop Scanner"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Camera Viewport */}
                                    <div className="flex-1 relative rounded-2xl overflow-hidden bg-black">
                                        <div id="qr-reader" className="w-full h-full"></div>

                                        {/* Scanning Frame Overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-64 h-64 relative">
                                                    {/* Corner brackets */}
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

                                                    {/* Scanning line animation */}
                                                    <motion.div
                                                        animate={{ y: [0, 240, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                        className="absolute top-2 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-center text-xs text-slate-400 mt-3">
                                        Position the QR code within the frame
                                    </p>
                                </motion.div>
                            )}

                            {/* Scan Processed */}
                            {scanResult && (
                                <motion.div
                                    key="processed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center relative z-10"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${scanResult.error ? 'bg-red-500/20' : 'bg-green-500/20'
                                            }`}
                                    >
                                        {scanResult.error ? (
                                            <XCircle className="w-10 h-10 text-red-400" />
                                        ) : (
                                            <CheckCircle className="w-10 h-10 text-green-400" />
                                        )}
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {scanResult.error ? 'Scan Failed' : 'QR Code Scanned'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        {scanResult.error ? scanResult.message : 'Order details shown on the right'}
                                    </p>
                                    <button
                                        onClick={resetScanner}
                                        className="py-3 px-6 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                    >
                                        <Scan className="w-5 h-5" />
                                        Scan Another
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Manual Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-2xl p-5"
                    >
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                            <Search className="w-4 h-4 text-primary" />
                            Manual Entry
                        </h3>
                        <form onSubmit={handleManualVerify} className="flex gap-2">
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Enter Order ID (e.g., FS-...)"
                                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                            <button
                                type="submit"
                                disabled={loading || !manualId.trim()}
                                className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50 font-medium"
                            >
                                {loading && manualId ? <Loader className="w-5 h-5 animate-spin" /> : 'Verify'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Result Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-2xl p-6 h-fit"
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Verification Result
                    </h2>

                    {loading && !manualId ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : scanResult && !scanResult.error ? (
                        <div className="space-y-5">
                            <div className={`p-4 rounded-xl flex items-start gap-3 ${scanResult.valid ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                                {scanResult.valid ? (
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-bold text-lg ${scanResult.valid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {scanResult.valid ? 'Valid Order' : 'Attention Needed'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Order ID</p>
                                    <p className="font-mono font-semibold text-sm truncate">{scanResult.order.orderId}</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Date</p>
                                    <p className="font-semibold text-sm">{new Date(scanResult.order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Customer</p>
                                    <p className="font-semibold text-sm">{scanResult.order.customerName}</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                                    <p className="font-semibold text-sm">{scanResult.order.customerPhone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20 p-5 rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium">{scanResult.order.fuelType}</span>
                                    <span className="font-bold">{scanResult.order.liters} Liters</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl font-bold text-primary border-t border-primary/20 pt-3">
                                    <span>Total</span>
                                    <span>₹{scanResult.order.totalAmount}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${scanResult.order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    Payment: {scanResult.order.paymentStatus}
                                </span>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${scanResult.order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    Status: {scanResult.order.status}
                                </span>
                            </div>

                            {scanResult.valid && (
                                <button
                                    onClick={completeOrder}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition font-bold text-lg flex items-center justify-center gap-2 mt-2"
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Complete Order
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : scanResult?.error ? (
                        <div className="text-center py-12 bg-red-500/10 rounded-xl border border-red-500/20">
                            <XCircle className="w-14 h-14 mx-auto mb-3 text-red-400" />
                            <p className="font-bold text-red-500 text-lg">Verification Failed</p>
                            <p className="text-sm text-muted-foreground mt-1">{scanResult.message}</p>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No order scanned</p>
                            <p className="text-xs text-muted-foreground mt-1">Scan a QR code or enter ID to verify</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Custom CSS for html5-qrcode */}
            <style>{`
                #qr-reader {
                    border: none !important;
                    width: 100% !important;
                }
                #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 12px !important;
                }
                #qr-reader__scan_region {
                    background: transparent !important;
                }
                #qr-reader__dashboard {
                    display: none !important;
                }
                #qr-reader__header_message {
                    display: none !important;
                }
                #qr-reader__status_span {
                    display: none !important;
                }
                #qr-reader img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
