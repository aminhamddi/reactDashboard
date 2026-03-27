// dashboard-web/src/components/admin/ProtectedAdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../../services/auth';

export default function ProtectedAdminRoute({ children }) {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Allow admin and manager roles
    if (user.role !== 'admin' && user.role !== 'manager') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <div className="text-red-600 text-5xl mb-4">⛔</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Accès refusé
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vous devez être administrateur ou gestionnaire pour accéder à cette page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Votre rôle actuel : <span className="font-semibold">{user.role}</span>
                    </p>
                </div>
            </div>
        );
    }

    return children;
}