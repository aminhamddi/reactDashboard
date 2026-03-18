import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export default function CategoryRadarChart({ data }) {
  console.log('🎯 RadarChart - Données reçues:', data);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Scores par Catégorie (Radar)
        </h3>
        <p className="text-gray-500 text-center py-8">
          Pas encore de données à afficher
        </p>
      </div>
    );
  }

  // ✅ EXTRAIRE PLANTS DYNAMIQUEMENT depuis les données
  const firstItem = data[0];
  const plants = Object.keys(firstItem).filter(key => key !== 'category');

  console.log('🎯 RadarChart - Plants extraits:', plants);
  console.log('🎯 RadarChart - Premier item:', firstItem);

  if (plants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Scores par Catégorie (Radar)
        </h3>
        <p className="text-red-500 text-center py-8">
          Erreur : Aucun plant trouvé dans les données
        </p>
        <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-auto">
          {JSON.stringify(data[0], null, 2)}
        </pre>
      </div>
    );
  }

  // ✅ COULEURS pour jusqu'à 10 plants
  const colors = [
    '#2196F3', // Bleu
    '#4CAF50', // Vert
    '#FF9800', // Orange
    '#9C27B0', // Violet
    '#F44336', // Rouge
    '#00BCD4', // Cyan
    '#FFEB3B', // Jaune
    '#795548', // Marron
    '#607D8B', // Gris bleu
    '#E91E63', // Rose
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Scores par Catégorie (Radar)
      </h3>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        Plants détectés : {plants.join(', ')}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />

          {/* ✅ GÉNÉRER UN RADAR PAR PLANT DYNAMIQUEMENT */}
          {plants.map((plant, index) => (
            <Radar
              key={plant}
              name={plant}
              dataKey={plant}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          ))}

          <Legend wrapperStyle={{ fontSize: '13px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Liste catégories */}
      <div className="mt-4 text-xs text-gray-600">
        <p className="font-semibold mb-1">Catégories ({data.length}) :</p>
        <div className="flex flex-wrap gap-1">
          {data.map((item, index) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded">
              {item.category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}