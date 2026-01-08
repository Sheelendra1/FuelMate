import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { QrCode, CheckCircle, XCircle, Loader, Package, AlertTriangle, Search } from 'lucide-react';

export default function ScanQR() {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);
    const [manualId, setManualId] = useState('');

    const scannerRef = useRef(null);

    // Verify order function - specific to our backend API
    const verifyOrder = useCallback(async (qrData) => {
        if (!qrData) return;

        try {
            setLoading(true);
            console.log('Verifying QR Data:', qrData);

            const response = await api.post('/orders/verify', { qrData });
            setScanResult(response.data);

            if (response.data.valid) {
                toast.success('Order verified successfully');
                // Auto-stop scanner on success
                setScannerActive(false);
            } else if (response.data.success) {
                toast.error(response.data.message || 'Order found but not valid for completion');
                setScannerActive(false);
            }
        } catch (error) {
            console.error('Verification error:', error);
            const msg = error.response?.data?.message || 'Failed to verify QR code';
            toast.error(msg);
            setScanResult({ error: true, message: msg });
        } finally {
            setLoading(false);
        }
    }, []);

    // Callback for scanner success
    const onScanSuccess = useCallback((decodedText) => {
        verifyOrder(decodedText);
    }, [verifyOrder]);

    const onScanFailure = useCallback((error) => {
        // Just log warnings, don't spam UI
        // console.warn(error);
    }, []);

    // Effect to manage the scanner lifecycle
    useEffect(() => {
        // If scanner is not active, we shouldn't attempt to render it
        if (!scannerActive) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error('Failed to clear scanner', e));
                scannerRef.current = null;
            }
            return;
        }

        // Delay initialization to ensure DOM is ready
        const timer = setTimeout(() => {
            const element = document.getElementById('reader');
            if (element && !element.innerHTML) {
                try {
                    // Create instance
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        false // verbose
                    );

                    // Render
                    scanner.render(onScanSuccess, onScanFailure);
                    scannerRef.current = scanner;
                } catch (err) {
                    console.error('Scanner initialization failed:', err);
                    toast.error('Failed to start camera');
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(e => console.error('Cleanup error', e));
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [scannerActive, onScanSuccess, onScanFailure]);

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        verifyOrder(manualId.trim());
    };

    const resetScanner = () => {
        setScanResult(null);
        setManualId('');
        setScannerActive(true);
    };

    const completeOrder = async () => {
        if (!scanResult?.order?.orderId) return;

        try {
            setActionLoading(true);
            await api.put(`/orders/${scanResult.order.orderId}/complete`);
            toast.success('Order completed successfully!');
            // Reset after short delay
            setTimeout(resetScanner, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <QrCode className="w-8 h-8 text-primary" />
                    Scan QR Code
                </h1>
                <p className="text-muted-foreground mt-1">Scan customer order QR code or enter Order ID manually</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Scanner / Input Section */}
                <div className="space-y-6">
                    {/* Camera Scanner */}
                    <div className="bg-card border border-border rounded-lg p-6 min-h-[400px] flex flex-col">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <QrCode className="w-4 h-4" /> Camera Scan
                        </h3>

                        {scannerActive ? (
                            <div className="flex-1 flex flex-col justify-center">
                                <div id="reader" className="overflow-hidden rounded-lg mx-auto w-full max-w-sm border bg-black"></div>
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Ensure permissions are granted
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Scan Processed</h3>
                                <button
                                    onClick={resetScanner}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                                >
                                    Scan Another
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Manual Input Fallback */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Manual Entry
                        </h3>
                        <form onSubmit={handleManualVerify} className="flex gap-2">
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Enter Order ID (e.g., FS-...)"
                                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={loading || !manualId.trim()}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition disabled:opacity-50"
                            >
                                {loading && manualId ? <Loader className="w-4 h-4 animate-spin" /> : 'Verify'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-card border border-border rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Verification Result</h2>

                    {loading && !manualId ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : scanResult ? (
                        <div className="space-y-6">
                            {scanResult.error ? (
                                <div className="text-center py-8 text-red-500 bg-red-500/10 rounded-lg">
                                    <XCircle className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-semibold">Verification Failed</p>
                                    <p className="text-sm mt-1">{scanResult.message}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg flex items-start gap-3 ${scanResult.valid ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'}`}>
                                        {scanResult.valid ? (
                                            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className="font-bold text-lg">{scanResult.valid ? 'Valid Order' : 'Attention Needed'}</p>
                                            <p className="text-sm opacity-90">{scanResult.message}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-border pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Order ID</p>
                                                <p className="font-mono font-medium truncate" title={scanResult.order.orderId}>{scanResult.order.orderId}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Date</p>
                                                <p className="font-medium">{new Date(scanResult.order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Customer</p>
                                                <p className="font-medium">{scanResult.order.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Phone</p>
                                                <p className="font-medium">{scanResult.order.customerPhone || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-muted p-4 rounded-lg space-y-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{scanResult.order.fuelType}</span>
                                                <span>{scanResult.order.liters} L</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg font-bold text-primary border-t border-border/50 pt-2">
                                                <span>Total</span>
                                                <span>₹{scanResult.order.totalAmount}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${scanResult.order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                Payment: {scanResult.order.paymentStatus}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${scanResult.order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                Status: {scanResult.order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {scanResult.valid && (
                                        <button
                                            onClick={completeOrder}
                                            disabled={actionLoading}
                                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition font-bold text-lg flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            {actionLoading ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Complete Order Now
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center h-full">
                            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
                            <p className="text-muted-foreground font-medium">No order details</p>
                            <p className="text-xs text-muted-foreground mt-1">Scan a QR code or enter ID to verify</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
