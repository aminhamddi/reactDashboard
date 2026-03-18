// dashboard-web/src/pages/admin/AdminQuestions.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getCategories,
    getGravites,
    getServices,
} from '../../services/adminApi';

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [gravites, setGravites] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        numero: '',
        texte: '',
        categorie_id: 1,
        gravite_id: 1,
        service_id: 1,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [questionsRes, categoriesRes, gravitesRes, servicesRes] = await Promise.all([
                getQuestions(),
                getCategories(),
                getGravites(),
                getServices(),
            ]);

            setQuestions(questionsRes.data);
            setCategories(categoriesRes.data);
            setGravites(gravitesRes.data);
            setServices(servicesRes.data);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateQuestion(editingId, formData);
                alert('Question mise à jour');
            } else {
                await createQuestion(formData);
                alert('Question créée');
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur : ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (question) => {
        setFormData({
            numero: question.numero,
            texte: question.texte,
            categorie_id: question.categorie_id,
            gravite_id: question.gravite_id,
            service_ids: question.services ? question.services.map(s => s.id) : [],
        });
        setEditingId(question.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette question ?')) return;

        try {
            await deleteQuestion(id);
            alert('Question supprimée');
            loadData();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            numero: '',
            texte: '',
            categorie_id: 1,
            gravite_id: 1,
            service_ids: [],
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
                        Questions ({questions.length})
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Nouvelle Question'}
                    </button>
                </div>

                {/* Formulaire */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? 'Modifier Question' : 'Nouvelle Question'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numéro *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie *
                                    </label>
                                    <select
                                        value={formData.categorie_id}
                                        onChange={(e) => setFormData({ ...formData, categorie_id: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Texte de la question *
                                </label>
                                <textarea
                                    value={formData.texte}
                                    onChange={(e) => setFormData({ ...formData, texte: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gravité *
                                </label>
                                <select
                                    value={formData.gravite_id}
                                    onChange={(e) => setFormData({ ...formData, gravite_id: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {gravites.map((grav) => (
                                        <option key={grav.id} value={grav.id}>
                                            Niveau {grav.niveau} - {grav.nom} (Poids: {grav.poids})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Services responsables
                                </label>
                                <select
                                    multiple
                                    value={formData.service_ids}
                                    onChange={(e) => {
                                        const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                        setFormData({ ...formData, service_ids: selectedIds });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    size="5"
                                >
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.nom}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Maintenir Ctrl/Cmd pour sélectionner plusieurs</p>
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

                {/* Liste Questions */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravité</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {questions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {q.numero}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {q.texte}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {categories.find(c => c.id === q.categorie_id)?.nom || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        Niveau {gravites.find(g => g.id === q.gravite_id)?.niveau || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(q)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Éditer
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
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