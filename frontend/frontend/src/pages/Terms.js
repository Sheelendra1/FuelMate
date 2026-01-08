import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-muted rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Terms of Service
                    </h1>
                    <p className="text-muted-foreground">Last updated: January 2025</p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing and using FuelMate, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information up to date. You are responsible for safeguarding your password and for all activities that occur under your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Fuel Ordering & Payments</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        FuelMate facilitates the ordering of fuel from partner stations. Payment processing is handled securely. Prices are subject to change based on daily fuel rates. Refunds and cancellations are subject to our refund policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        FuelMate is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Modifications</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We reserve the right to modify these terms at any time. Continued use of the service after such changes constitutes acceptance of the new terms.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
