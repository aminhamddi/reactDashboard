import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { saveToken, saveUser } from '../services/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            saveToken(response.data.access_token);

            // Récupérer info user
            try {
                const userResponse = await fetch(`http://${window.location.hostname}:8000/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.access_token}`
                    }
                });
                const userData = await userResponse.json();
                saveUser(userData);
            } catch (err) {
                console.error('Erreur récupération user:', err);
            }

            // Force page reload to ensure App.jsx re-validates token
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Email ou mot de passe incorrect');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4"></div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">OEE Audit</h1>
                    <p className="text-gray-600">Dashboard Manager</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="admin@oee.tn"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">Credentials test :</p>
                    <p className="font-mono text-xs mt-1 text-gray-500">
                        admin@oee.tn / admin123
                    </p>
                </div>
            </div>
        </div>
    );
}