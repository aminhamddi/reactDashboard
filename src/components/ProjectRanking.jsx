import React from 'react';

export default function ProjectRanking({ data }) {
    if (!data || data.length === 0) return null;

    const getStatus = (score, target, stTarget) => {
        if (score >= stTarget) return { color: 'text-green-700', bg: 'bg-green-100' };
        if (score >= target) return { color: 'text-yellow-700', bg: 'bg-yellow-100' };
        return { color: 'text-red-700', bg: 'bg-red-100' };
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Classement Projet
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Projet</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Résultat</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-600">Target</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-green-600">ST Target</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Classement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            const status = getStatus(item.score, item.target, item.st_target);
                            return (
                                <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {item.medal && <span className="mr-2">{item.medal}</span>}
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.bg} ${status.color}`}>
                                            {item.score.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-yellow-700 font-medium">{item.target}%</td>
                                    <td className="px-4 py-3 text-center text-sm text-green-700 font-medium">{item.st_target}%</td>
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
        </div>
    );
}
