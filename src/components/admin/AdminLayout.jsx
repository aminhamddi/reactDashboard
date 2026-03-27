// dashboard-web/src/components/admin/AdminLayout.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { removeToken, getUser } from '../../services/auth';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    // Menu items - Include users only for admin
    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/plants', label: 'Plants', icon: '🏭' },
        { path: '/admin/services', label: 'Services', icon: '🔧' },
        { path: '/admin/questions', label: 'Questions', icon: '❓' },
        { path: '/admin/categories', label: 'Catégories', icon: '📁' },
        { path: '/admin/gravites', label: 'Gravités', icon: '⚠️' },
    ];

    // Add users only for admin role
    if (user?.role === 'admin') {
        menuItems.push({ path: '/admin/users', label: 'Utilisateurs', icon: '👥' });
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            👨‍💼 Administration
                        </h1>
                        <p className="text-sm text-gray-600">
                            Connecté en tant que : <span className="font-semibold">{user?.nom}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            ← Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${location.pathname === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}