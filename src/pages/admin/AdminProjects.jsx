// dashboard-web/src/pages/admin/AdminProjects.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/adminApi';

export default function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        actif: true,
        ordre_affichage: 1,
        target_percentage: 0.85,
    });

    const toPercent = (val) => Math.round((val || 0) * 100);
    const fromPercent = (val) => parseFloat(val) / 100;

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await getProjects();
            setProjects(response.data);
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
                await updateProject(editingId, formData);
                alert('Projet mis à jour');
            } else {
                await createProject(formData);
                alert('Projet créé');
            }
            resetForm();
            loadProjects();
        } catch (error) {
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (project) => {
        setFormData({
            nom: project.nom,
            description: project.description || '',
            actif: project.actif,
            ordre_affichage: project.ordre_affichage || 1,
            target_percentage: project.target_percentage ?? 0.85,
        });
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce projet ?')) return;
        try {
            await deleteProject(id);
            alert('Projet supprimé');
            loadProjects();
        } catch (error) {
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const resetForm = () => {
        setFormData({ nom: '', description: '', actif: true, ordre_affichage: projects.length + 1, target_percentage: 0.85 });
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
                        Projets ({projects.length})
                    </h2>
                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouveau Projet'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Projet' : 'Nouveau Projet'}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target (%)</label>
                                    <input
                                        type="number"
                                        value={toPercent(formData.target_percentage)}
                                        onChange={(e) => setFormData({ ...formData, target_percentage: fromPercent(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="100"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target (%)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actif</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects
                                .sort((a, b) => (a.ordre_affichage || 999) - (b.ordre_affichage || 999))
                                .map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.ordre_affichage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.nom}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{project.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{toPercent(project.target_percentage)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${project.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {project.actif ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEdit(project)} className="text-blue-600 hover:text-blue-800 font-medium">Éditer</button>
                                            <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800 font-medium">Supprimer</button>
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
