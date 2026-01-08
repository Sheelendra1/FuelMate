import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
                        <Globe className="w-6 h-6 text-primary" />
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground">Last updated: January 2025</p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Information Collection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We collect information you provide directly to us, such as when you create an account, make a purchase, or communicate with us. This includes your name, email address, phone number, and vehicle details.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. Use of Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We use the information we collect to operate, maintain, and improve our services, to process transactions, and to communicate with you about your account and updates to our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We do not sell your personal information. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
