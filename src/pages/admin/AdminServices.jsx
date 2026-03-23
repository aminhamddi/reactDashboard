import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getServices, createService, updateService, deleteService } from '../../services/adminApi';

export default function AdminServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        responsable_defaut: '',
        actif: true,
        ordre_affichage: 1,
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await getServices();
            setServices(response.data);
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
                await updateService(editingId, formData);
                alert('Service mis à jour');
            } else {
                await createService(formData);
                alert('Service créé');
            }
            resetForm();
            loadServices();
        } catch (error) {
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (service) => {
        setFormData({
            nom: service.nom,
            responsable_defaut: service.responsable_defaut || '',
            actif: service.actif,
            ordre_affichage: service.ordre_affichage || 1,
        });
        setEditingId(service.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce service ?')) return;
        try {
            await deleteService(id);
            alert('Service supprimé');
            loadServices();
        } catch (error) {
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const resetForm = () => {
        setFormData({ nom: '', responsable_defaut: '', actif: true, ordre_affichage: services.length + 1 });
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
                        Services ({services.length})
                    </h2>
                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouveau Service'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Service' : 'Nouveau Service'}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable par défaut</label>
                                    <input
                                        type="text"
                                        value={formData.responsable_defaut}
                                        onChange={(e) => setFormData({ ...formData, responsable_defaut: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <label className="text-sm text-gray-700">Actif</label>
                                </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actif</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {services
                                .sort((a, b) => (a.ordre_affichage || 999) - (b.ordre_affichage || 999))
                                .map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.ordre_affichage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.nom}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.responsable_defaut || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${service.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {service.actif ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800 font-medium">Éditer</button>
                                            <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800 font-medium">Supprimer</button>
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
