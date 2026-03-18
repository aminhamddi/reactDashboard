// dashboard-web/src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/adminApi';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        poids_total: 6,
        ordre_affichage: 1,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories();
            setCategories(response.data);
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
                await updateCategory(editingId, formData);
                alert('Catégorie mise à jour');
            } else {
                await createCategory(formData);
                alert('Catégorie créée');
            }

            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (category) => {
        setFormData({
            nom: category.nom,
            poids_total: category.poids_total,
            ordre_affichage: category.ordre_affichage || 1,
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette catégorie ?')) return;

        try {
            await deleteCategory(id);
            alert('Catégorie supprimée');
            loadCategories();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            poids_total: 6,
            ordre_affichage: 1,
        });
        setEditingId(null);
        setShowForm(false);
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
                        Catégories ({categories.length})
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouvelle Catégorie'}
                    </button>
                </div>

                {/* Formulaire */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poids Total *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.poids_total}
                                        onChange={(e) => setFormData({ ...formData, poids_total: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.ordre_affichage}
                                        onChange={(e) => setFormData({ ...formData, ordre_affichage: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
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

                {/* Liste Catégories */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poids Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories
                                .sort((a, b) => (a.ordre_affichage || 999) - (b.ordre_affichage || 999))
                                .map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cat.ordre_affichage}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cat.nom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {cat.poids_total}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Éditer
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
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