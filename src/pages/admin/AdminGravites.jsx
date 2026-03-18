// dashboard-web/src/pages/admin/AdminGravites.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getGravites, createGravite, updateGravite, deleteGravite } from '../../services/adminApi';

export default function AdminGravites() {
    const [gravites, setGravites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        niveau: 1,
        nom: '',
        poids: 1,
        notes_autorisees: [0, 1, 2, 3, 4, 5],
    });

    useEffect(() => {
        loadGravites();
    }, []);

    const loadGravites = async () => {
        try {
            setLoading(true);
            const response = await getGravites();
            setGravites(response.data);
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
                await updateGravite(editingId, formData);
                alert('Gravité mise à jour');
            } else {
                await createGravite(formData);
                alert('Gravité créée');
            }

            resetForm();
            loadGravites();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (gravite) => {
        setFormData({
            niveau: gravite.niveau,
            nom: gravite.nom,
            poids: gravite.poids,
            notes_autorisees: gravite.notes_autorisees || [0, 1, 2, 3, 4, 5],
        });
        setEditingId(gravite.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette gravité ?')) return;

        try {
            await deleteGravite(id);
            alert('Gravité supprimée');
            loadGravites();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            niveau: 1,
            nom: '',
            poids: 1,
            notes_autorisees: [0, 1, 2, 3, 4, 5],
        });
        setEditingId(null);
        setShowForm(false);
    };

    const toggleNote = (note) => {
        const notes = [...formData.notes_autorisees];
        const index = notes.indexOf(note);
        if (index > -1) {
            notes.splice(index, 1);
        } else {
            notes.push(note);
        }
        notes.sort((a, b) => a - b);
        setFormData({ ...formData, notes_autorisees: notes });
    };

    const getPoidsColor = (poids) => {
        switch (poids) {
            case 1:
                return 'bg-blue-100 text-blue-800';
            case 2:
                return 'bg-yellow-100 text-yellow-800';
            case 3:
                return 'bg-orange-100 text-orange-800';
            case 4:
                return 'bg-red-100 text-red-800';
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
                        Gravités ({gravites.length})
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouvelle Gravité'}
                    </button>
                </div>

                {/* Formulaire */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Gravité' : 'Nouvelle Gravité'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Niveau *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.niveau}
                                        onChange={(e) => setFormData({ ...formData, niveau: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                        max="10"
                                    />
                                </div>

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
                                        placeholder="Recommandé, Important..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poids *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.poids}
                                        onChange={(e) => setFormData({ ...formData, poids: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes autorisées *
                                </label>
                                <div className="flex gap-2">
                                    {[0, 1, 2, 3, 4, 5].map((note) => (
                                        <button
                                            key={note}
                                            type="button"
                                            onClick={() => toggleNote(note)}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${formData.notes_autorisees.includes(note)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {note}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Sélectionné : {formData.notes_autorisees.join(', ')}
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <strong>💡 Exemples :</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Niveau 1 (Recommandé) : Poids 1, Notes [0,1,2,3,4,5]</li>
                                    <li>• Niveau 2 (Important) : Poids 2, Notes [0,1,2,3,4,5]</li>
                                    <li>• Niveau 3 (Très Important) : Poids 3, Notes [0,2,4,5]</li>
                                    <li>• Niveau 4 (Critique) : Poids 4, Notes [0,5]</li>
                                </ul>
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

                {/* Liste Gravités */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poids</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes autorisées</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {gravites
                                .sort((a, b) => a.niveau - b.niveau)
                                .map((grav) => (
                                    <tr key={grav.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {grav.niveau}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {grav.nom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 rounded-full font-semibold ${getPoidsColor(grav.poids)}`}>
                                                {grav.poids}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {grav.notes_autorisees?.join(', ') || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => handleEdit(grav)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Éditer
                                            </button>
                                            <button
                                                onClick={() => handleDelete(grav.id)}
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