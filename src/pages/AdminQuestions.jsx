import React, { useState, useEffect } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/api';

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        numero: '',
        texte: '',
        categorie_id: 1,
        gravite_id: 1,
        responsables: []
    });

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        const res = await getQuestions();
        setQuestions(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await updateQuestion(editingId, formData);
        } else {
            await createQuestion(formData);
        }
        loadQuestions();
        resetForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette question ?')) {
            await deleteQuestion(id);
            loadQuestions();
        }
    };

    const resetForm = () => {
        setFormData({ numero: '', texte: '', categorie_id: 1, gravite_id: 1, responsables: [] });
        setEditingId(null);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Gestion Questions</h1>

            {/* Formulaire */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingId ? 'Modifier Question' : 'Nouvelle Question'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Numéro</label>
                        <input
                            type="number"
                            value={formData.numero}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Texte Question</label>
                        <textarea
                            value={formData.texte}
                            onChange={(e) => setFormData({ ...formData, texte: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Catégorie</label>
                            <select
                                value={formData.categorie_id}
                                onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="1">Objectif OEE</option>
                                <option value="2">Réunion journalière</option>
                                {/* ... autres catégories */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Gravité</label>
                            <select
                                value={formData.gravite_id}
                                onChange={(e) => setFormData({ ...formData, gravite_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="1">Recommandé</option>
                                <option value="2">Important</option>
                                <option value="3">Très Important</option>
                                <option value="4">Critique</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {editingId ? 'Mettre à jour' : 'Créer'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste Questions */}
            <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravité</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {questions.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{q.numero}</td>
                                <td className="px-6 py-4">{q.texte}</td>
                                <td className="px-6 py-4">{q.categorie_nom}</td>
                                <td className="px-6 py-4">{q.gravite_niveau}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        onClick={() => {
                                            setFormData(q);
                                            setEditingId(q.id);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Éditer
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="text-red-600 hover:text-red-800"
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
    );
}