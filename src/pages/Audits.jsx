import React, { useEffect, useState } from 'react';
import { getAudits } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Audits() {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadAudits();
    }, []);

    const loadAudits = async () => {
        try {
            const response = await getAudits({ limit: 50 });
            setAudits(response.data);
        } catch (error) {
            console.error('Erreur chargement audits:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Liste Audits</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        ← Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {audits.map((audit) => (
                                <tr key={audit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">{audit.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{audit.plant?.nom || audit.plant || '—'}</td>
                                    <td className="px-6 py-4 text-sm">{audit.date_audit}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`font-semibold ${audit.score_global >= 0.8 ? 'text-green-600' :
                                                audit.score_global >= 0.6 ? 'text-orange-600' :
                                                    'text-red-600'
                                            }`}>
                                            {audit.score_global ? `${(audit.score_global * 100).toFixed(1)}%` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${audit.statut === 'finalized' ? 'bg-green-100 text-green-800' :
                                                audit.statut === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {audit.statut === 'finalized' ? 'Finalisé' : audit.statut === 'draft' ? 'Brouillon' : audit.statut}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
