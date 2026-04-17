// dashboard-web/src/components/BarChart.jsx
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

export default function PlantBarChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Comparaison Plants
                </h3>
                <p className="text-gray-500 text-center py-8">
                    Pas encore de données à afficher
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Comparaison Plants (Barres)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                        }}
                    />
                    <ReferenceLine 
                        y={80} 
                        stroke="#FFC107" 
                        strokeDasharray="5 5" 
                        strokeWidth={3} 
                    />
                    <ReferenceLine 
                        y={95} 
                        stroke="#4CAF50" 
                        strokeDasharray="5 5" 
                        strokeWidth={3} 
                    />
                    <Bar dataKey="score" fill="#2196F3" name="Score" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            
            {/* Custom Legend Footer */}
            <div className="flex justify-center gap-6 mt-4 border-t pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#2196F3] rounded"></div>
                    <span className="text-sm text-gray-600">Score</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-[#FFC107] border-t-2 border-b-2 border-[#FFC107] border-dashed"></div>
                    <span className="text-sm text-gray-600 font-bold">Target (80%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-[#4CAF50] border-t-2 border-b-2 border-[#4CAF50] border-dashed"></div>
                    <span className="text-sm text-gray-600 font-bold">ST Target (95%)</span>
                </div>
            </div>
        </div>
    );
}
