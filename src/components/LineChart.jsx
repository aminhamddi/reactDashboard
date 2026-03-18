import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScoreLineChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Évolution Scores
                </h3>
                <p className="text-gray-500 text-center py-8">
                    Pas encore de données à afficher
                </p>
            </div>
        );
    }

    // Extraire noms des plants dynamiquement
    const plants = Object.keys(data[0]).filter(key => key !== 'date');

    // Couleurs pour les plants
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Évolution Scores (6 derniers mois)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                    />

                    {/* Générer lignes dynamiquement pour chaque plant */}
                    {plants.map((plant, index) => (
                        <Line
                            key={plant}
                            type="monotone"
                            dataKey={plant}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}