import React from 'react';

export default function SiteRanking({ data }) {
    if (!data || data.length === 0) return null;

    const getStatus = (score, target, stTarget) => {
        if (score >= stTarget) return { color: 'bg-green-500', label: '🟢', textColor: 'text-green-700' };
        if (score >= target) return { color: 'bg-yellow-400', label: '🟡', textColor: 'text-yellow-700' };
        return { color: 'bg-red-400', label: '🔴', textColor: 'text-red-700' };
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Classement Site
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Site</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Résultat</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-600">Target</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-green-600">ST Target</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Statut</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Classement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            const status = getStatus(item.score, item.target, item.st_target);
                            return (
                                <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-lg font-bold ${status.textColor}`}>
                                            {item.score.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-yellow-700 font-medium">{item.target}%</td>
                                    <td className="px-4 py-3 text-center text-sm text-green-700 font-medium">{item.st_target}%</td>
                                    <td className="px-4 py-3 text-center text-2xl">{status.label}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                                            {item.rank}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2"><span>🟢</span> ≥ ST Target</div>
                <div className="flex items-center gap-2"><span>🟡</span> ≥ Target</div>
                <div className="flex items-center gap-2"><span>🔴</span> {'<'} Target</div>
            </div>
        </div>
    );
}
