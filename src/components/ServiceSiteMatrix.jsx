import React from 'react';

export default function ServiceSiteMatrix({ data }) {
    if (!data || !data.services || data.services.length === 0) return null;

    const { services, total_row, plant_names } = data;

    const getColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 80) return 'bg-green-400';
        if (score >= 70) return 'bg-yellow-400';
        if (score >= 60) return 'bg-orange-400';
        if (score > 0) return 'bg-red-400';
        return 'bg-gray-200';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Résultat par Service × Site
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 sticky left-0">
                                Service
                            </th>
                            {plant_names.map((name) => (
                                <th key={name} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 bg-gray-50">
                                    {name}
                                </th>
                            ))}
                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-800 bg-gray-100">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((row) => (
                            <tr key={row.service} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                                    {row.service}
                                </td>
                                {plant_names.map((pname) => {
                                    const score = row.plants[pname] || 0;
                                    return (
                                        <td key={pname} className="px-3 py-2 text-center">
                                            <div
                                                className={`inline-block px-2 py-1 rounded text-white font-semibold text-xs ${getColor(score)}`}
                                                style={{ opacity: score > 0 ? (score / 100) * 0.8 + 0.2 : 0.3, minWidth: '48px' }}
                                            >
                                                {score > 0 ? score.toFixed(1) + '%' : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="px-3 py-2 text-center">
                                    <div
                                        className={`inline-block px-2 py-1 rounded text-white font-bold text-xs ${getColor(row.total)}`}
                                        style={{ opacity: row.total > 0 ? (row.total / 100) * 0.8 + 0.2 : 0.3, minWidth: '48px' }}
                                    >
                                        {row.total > 0 ? row.total.toFixed(1) + '%' : '-'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Total row */}
                        <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                            <td className="px-4 py-2 text-sm text-gray-800 sticky left-0 bg-gray-50">
                                Résultat Total
                            </td>
                            {plant_names.map((pname) => {
                                const score = total_row.plants[pname] || 0;
                                return (
                                    <td key={pname} className="px-3 py-2 text-center">
                                        <div
                                            className={`inline-block px-2 py-1 rounded text-white font-bold text-sm ${getColor(score)}`}
                                            style={{ opacity: score > 0 ? (score / 100) * 0.8 + 0.2 : 0.3, minWidth: '48px' }}
                                        >
                                            {score > 0 ? score.toFixed(1) + '%' : '-'}
                                        </div>
                                    </td>
                                );
                            })}
                            <td className="px-3 py-2 text-center">
                                <div
                                    className={`inline-block px-2 py-1 rounded text-white font-bold text-sm ${getColor(total_row.total)}`}
                                    style={{ opacity: (total_row.total / 100) * 0.8 + 0.2, minWidth: '48px' }}
                                >
                                    {total_row.total.toFixed(1)}%
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <span className="font-semibold">Score :</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div><span>&lt;60%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded"></div><span>60-70%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded"></div><span>70-80%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div><span>80-90%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div><span>≥90%</span></div>
            </div>
        </div>
    );
}
