import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 max-w-md">
                This feature is currently under development. Stay tuned for updates!
            </p>
        </div>
    );
};

export const Promotions = () => <PlaceholderPage title="Promotions Management" />;
export const Feedback = () => <PlaceholderPage title="User Feedback" />;
export const Configuration = () => <PlaceholderPage title="System Configuration" />;
export const Profile = () => <PlaceholderPage title="User Profile" />;
