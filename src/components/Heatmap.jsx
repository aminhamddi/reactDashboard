import React from 'react';

export default function Heatmap({ data, tb }) {
    console.log('🔥 Heatmap - Données reçues:', data);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Heatmap Plant × {tb}
                </h3>
                <p className="text-gray-500 text-center py-8">
                    Pas encore de données à afficher
                </p>
            </div>
        );
    }

    const getColorFromScore = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getOpacity = (score) => {
        return (score / 100) * 0.8 + 0.2; // 0.2 à 1.0
    };

    // ✅ EXTRAIRE catégories et plants DYNAMIQUEMENT
    const categories = [...new Set(data.map((d) => d.category))];
    const services = [...new Set(data.map((d) => d.service))];
    const plants = [...new Set(data.map((d) => d.plant))];


    console.log('🔥 Heatmap - Categories:', categories);
    console.log('🔥 Heatmap - Categories:', services);
    console.log('🔥 Heatmap - Plants:', plants);
    
    if (tb == "Catégorie")
    {return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Heatmap Plant × {tb}
            </h3>

            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-3">
                {plants.length} plants × {categories.length} {tb}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 bg-gray-50">
                                Catégorie
                            </th>
                            {plants.map((plant) => (
                                <th
                                    key={plant}
                                    className="px-4 py-2 text-center text-sm font-medium text-gray-600 bg-gray-50"
                                >
                                    {plant}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm font-medium text-gray-700">
                                    {category}
                                </td>
                                {plants.map((plant) => {
                                    const cell = data.find(
                                        (d) => d.category === category && d.plant === plant
                                    );
                                    const score = cell?.score || 0;

                                    return (
                                        <td key={plant} className="px-4 py-2 text-center">
                                            <div
                                                className={`inline-block px-3 py-2 rounded ${getColorFromScore(
                                                    score
                                                )}`}
                                                style={{ opacity: getOpacity(score) }}
                                            >
                                                <span className="text-white font-semibold text-sm">
                                                    {score.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <span className="font-semibold">Score :</span>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>&lt; 40%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>40-60%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>&gt; 80%</span>
                </div>
            </div>
        </div>)}
        else
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Heatmap Plant × {tb}
                </h3>

                {/* Debug info */}
                <div className="text-xs text-gray-500 mb-3">
                    {plants.length} plants × {categories.length} {tb}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 bg-gray-50">
                                    {tb}
                                </th>
                                {plants.map((plant) => (
                                    <th
                                        key={plant}
                                        className="px-4 py-2 text-center text-sm font-medium text-gray-600 bg-gray-50"
                                    >
                                        {plant}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((service) => (
                                <tr key={service} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm font-medium text-gray-700">
                                        {service}
                                    </td>
                                    {plants.map((plant) => {
                                        const cell = data.find(
                                            (d) => d.service === service && d.plant === plant
                                        );
                                        const score = cell?.score || 0;

                                        return (
                                            <td key={plant} className="px-4 py-2 text-center">
                                                <div
                                                    className={`inline-block px-3 py-2 rounded ${getColorFromScore(
                                                        score
                                                    )}`}
                                                    style={{ opacity: getOpacity(score) }}
                                                >
                                                    <span className="text-white font-semibold text-sm">
                                                        {score.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Légende */}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                    <span className="font-semibold">Score :</span>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>&lt; 40%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span>40-60%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>60-80%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>&gt; 80%</span>
                    </div>
                </div>
            </div>
    );
    

}