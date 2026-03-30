// dashboard-web/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getQuestions, getUsers, getCategories, getGravites, getPlants, getServices } from '../../services/adminApi';
import { getUser } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = getUser();
    const canManageUsers = user?.role === 'admin';
    const [stats, setStats] = useState({
        plants: 0,
        services: 0,
        questions: 0,
        users: 0,
        categories: 0,
        gravites: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [plantsRes, servicesRes, questionsRes, usersRes, categoriesRes, gravitesRes] = await Promise.all([
                getPlants().catch(() => ({ data: [] })),
                getServices().catch(() => ({ data: [] })),
                getQuestions().catch(() => ({ data: [] })),
                getUsers().catch(() => ({ data: [] })),
                getCategories().catch(() => ({ data: [] })),
                getGravites().catch(() => ({ data: [] })),
            ]);

            setStats({
                plants: plantsRes.data.length,
                services: servicesRes.data.length,
                questions: questionsRes.data.length,
                users: usersRes.data.length,
                categories: categoriesRes.data.length,
                gravites: gravitesRes.data.length,
            });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Vue d'ensemble
                </h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Plants</h3>
                            <span className="text-3xl">🏭</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{stats.plants}</p>
                        <p className="text-xs text-gray-500 mt-1">Usines</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Services</h3>
                            <span className="text-3xl">🔧</span>
                        </div>
                        <p className="text-3xl font-bold text-cyan-600">{stats.services}</p>
                        <p className="text-xs text-gray-500 mt-1">Départements</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Questions</h3>
                            <span className="text-3xl">❓</span>
                        </div>
                        <p className="text-3xl font-bold text-indigo-600">{stats.questions}</p>
                        <p className="text-xs text-gray-500 mt-1">Questions actives</p>
                    </div>

                    {canManageUsers && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Utilisateurs</h3>
                                <span className="text-3xl">👥</span>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{stats.users}</p>
                            <p className="text-xs text-gray-500 mt-1">Comptes</p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Catégories</h3>
                            <span className="text-3xl">📁</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{stats.categories}</p>
                        <p className="text-xs text-gray-500 mt-1">Catégories</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Gravités</h3>
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{stats.gravites}</p>
                        <p className="text-xs text-gray-500 mt-1">Niveaux</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => navigate('/admin/questions')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
                            <div className="text-2xl mb-2">➕</div>
                            <h4 className="font-semibold text-gray-900">Nouvelle question</h4>
                            <p className="text-sm text-gray-600">Ajouter une question d'audit</p>
                        </button>

                        {canManageUsers && (
                            <button onClick={() => navigate('/admin/users')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
                                <div className="text-2xl mb-2">👤</div>
                                <h4 className="font-semibold text-gray-900">Nouvel utilisateur</h4>
                                <p className="text-sm text-gray-600">Créer un compte utilisateur</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
