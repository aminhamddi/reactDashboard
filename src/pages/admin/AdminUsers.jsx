// dashboard-web/src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus, getServices } from '../../services/adminApi';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        role: 'auditeur',
        plant: 'Sousse',
        service_id: '',
    });

    const roles = ['admin', 'manager', 'auditeur', 'responsable', 'lecteur'];
    const plants = ['Sousse', 'Monastir', 'Sfax', 'LTN3', 'LTN4', 'WOTNMS', 'menzel hayet'];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const [usersRes, servicesRes] = await Promise.all([
                getUsers(),
                getServices(),
            ]);
            setUsers(usersRes.data);
            setServices(servicesRes.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                const updateData = { ...formData };
                delete updateData.password; // Ne pas envoyer password vide
                await updateUser(editingId, updateData);
                alert('Utilisateur mis à jour');
            } else {
                await createUser(formData);
                alert('Utilisateur créé');
            }

            resetForm();
            loadUsers();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (user) => {
        setFormData({
            email: user.email,
            password: '',
            nom: user.nom,
            role: user.role,
            plant: user.plant,
            service_id: user.service_id || '',
        });
        setEditingId(user.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;

        try {
            await deleteUser(id);
            alert('Utilisateur supprimé');
            loadUsers();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleUserStatus(id);
            loadUsers();
        } catch (error) {
            alert('Erreur changement statut');
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            nom: '',
            role: 'auditeur',
            plant: 'Sousse',
            service_id: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'manager':
                return 'bg-blue-100 text-blue-800';
            case 'auditeur':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Utilisateurs ({users.length})
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouvel Utilisateur'}
                    </button>
                </div>

                {/* Formulaire */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mot de passe {!editingId && '*'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required={!editingId}
                                        placeholder={editingId ? 'Laisser vide pour ne pas changer' : ''}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rôle *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plant *
                                    </label>
                                    <select
                                        value={formData.plant}
                                        onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        {plants.map((plant) => (
                                            <option key={plant} value={plant}>
                                                {plant}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Service
                                    </label>
                                    <select
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Aucun service</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingId ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Liste Users */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.nom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.plant}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${user.actif
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {user.actif ? 'Actif' : 'Inactif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Éditer
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}