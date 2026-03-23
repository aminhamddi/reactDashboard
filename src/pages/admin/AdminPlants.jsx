import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getPlants, createPlant, updatePlant, deletePlant } from '../../services/adminApi';

export default function AdminPlants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        actif: true,
        ordre_affichage: 1,
        target: 0.85,
        st_target: 0.95,
    });

    useEffect(() => {
        loadPlants();
    }, []);

    const loadPlants = async () => {
        try {
            setLoading(true);
            const response = await getPlants();
            setPlants(response.data);
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
                await updatePlant(editingId, formData);
                alert('Plant mis à jour');
            } else {
                await createPlant(formData);
                alert('Plant créé');
            }
            resetForm();
            loadPlants();
        } catch (error) {
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (plant) => {
        setFormData({
            nom: plant.nom,
            description: plant.description || '',
            actif: plant.actif,
            ordre_affichage: plant.ordre_affichage || 1,
            target: plant.target ?? 0.85,
            st_target: plant.st_target ?? 0.95,
        });
        setEditingId(plant.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce plant ?')) return;
        try {
            await deletePlant(id);
            alert('Plant supprimé');
            loadPlants();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            description: '',
            actif: true,
            ordre_affichage: plants.length + 1,
            target: 0.85,
            st_target: 0.95,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const toPercent = (val) => Math.round((val || 0) * 100);
    const fromPercent = (val) => parseFloat(val) / 100;

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
                        Plants / Usines ({plants.length})
                    </h2>
                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouveau Plant'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Plant' : 'Nouveau Plant'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        value={formData.ordre_affichage}
                                        onChange={(e) => setFormData({ ...formData, ordre_affichage: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target (%)</label>
                                    <input
                                        type="number"
                                        value={toPercent(formData.target)}
                                        onChange={(e) => setFormData({ ...formData, target: fromPercent(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Score minimum acceptable (défaut: 85%)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ST Target (%)</label>
                                    <input
                                        type="number"
                                        value={toPercent(formData.st_target)}
                                        onChange={(e) => setFormData({ ...formData, st_target: fromPercent(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Objectif semestre (défaut: 95%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.actif}
                                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <label className="text-sm text-gray-700">Actif</label>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    {editingId ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ST Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actif</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plants
                                .sort((a, b) => (a.ordre_affichage || 999) - (b.ordre_affichage || 999))
                                .map((plant) => (
                                    <tr key={plant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plant.ordre_affichage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plant.nom}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{plant.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-700">{toPercent(plant.target ?? 0.85)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">{toPercent(plant.st_target ?? 0.95)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${plant.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {plant.actif ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEdit(plant)} className="text-blue-600 hover:text-blue-800 font-medium">Éditer</button>
                                            <button onClick={() => handleDelete(plant.id)} className="text-red-600 hover:text-red-800 font-medium">Supprimer</button>
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
