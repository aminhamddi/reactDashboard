import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from 'recharts';
import { getAllPlantsHistory } from '../services/api';
import { removeToken, getUser } from '../services/auth';

const getScoreColor = (score, target, stTarget) => {
    if (score >= stTarget) return '#22c55e';
    if (score >= target) return '#eab308';
    return '#ef4444';
};

const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
};

function PlantBarChart({ plant }) {
    const chartData = plant.months.map((m) => ({
        month: formatMonth(m.month),
        score: m.score,
        audits: m.audits,
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {plant.name}
                </h3>
                <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                        Target: <span className="font-semibold text-yellow-600">{plant.target}%</span>
                    </span>
                    <span className="text-gray-600">
                        ST: <span className="font-semibold text-green-600">{plant.st_target}%</span>
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value, name) => {
                            if (name === 'score') return [`${value}%`, 'Score'];
                            return [value, name];
                        }}
                        labelFormatter={(label) => label}
                    />
                    <ReferenceLine
                        y={plant.target}
                        stroke="#eab308"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                    />
                    <ReferenceLine
                        y={plant.st_target}
                        stroke="#22c55e"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getScoreColor(entry.score, plant.target, plant.st_target)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-6 mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs text-gray-600">&lt; Target</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-xs text-gray-600">≥ Target</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-600">≥ ST</span>
                </div>
            </div>
        </div>
    );
}

export default function PlantChartsPage() {
    const [plantsData, setPlantsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [months, setMonths] = useState(6);
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        loadData();
    }, [months]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getAllPlantsHistory(months);
            setPlantsData(res.data.plants || []);
            setError('');
        } catch (err) {
            console.error('Erreur chargement:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-blue-600 hover:text-blue-800 text-sm mb-1 flex items-center gap-1"
                            >
                                ← Retour Dashboard
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Plants - Scores Mensuels
                            </h1>
                            <p className="text-sm text-gray-600">
                                Historique des scores par plant
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={months}
                                onChange={(e) => setMonths(parseInt(e.target.value))}
                                className="px-3 py-2 border rounded-lg text-sm"
                            >
                                <option value={3}>3 mois</option>
                                <option value={6}>6 mois</option>
                                <option value={12}>12 mois</option>
                                <option value={24}>24 mois</option>
                            </select>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                        <button onClick={loadData} className="ml-4 underline">
                            Réessayer
                        </button>
                    </div>
                )}

                {plantsData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg">Aucune donnée disponible</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Les données apparaîtront une fois les audits finalisés
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {plantsData.map((plant) => (
                            <PlantBarChart key={plant.name} plant={plant} />
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    {user && <span>Connecté en tant que {user.nom}</span>}
                </div>
            </main>
        </div>
    );
}
