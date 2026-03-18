import React from 'react';

export default function ScoreCard({ plant, score, auditsCount, trend, isLive }) {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 relative hover:shadow-lg transition-all">
            {/* Badge LIVE */}
            {isLive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    LIVE
                </div>
            )}

            {/* Plant */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{plant}</h3>

            {/* Score */}
            <div className={`text-5xl font-bold mb-4 p-4 rounded-lg ${getScoreColor(score)}`}>
                {score}%
            </div>

            {/* Audits count */}
            <p className="text-sm text-gray-600 mb-3">
                <span className="font-semibold">{auditsCount}</span> audits ce mois
            </p>

            {/* Trend */}
            <div className="flex items-center gap-2">
                {trend > 0 ? (
                    <>
                        <span className="text-green-600 text-2xl">↗</span>
                        <span className="text-sm text-green-600 font-medium">
                            +{trend}% vs mois dernier
                        </span>
                    </>
                ) : trend < 0 ? (
                    <>
                        <span className="text-red-600 text-2xl">↘</span>
                        <span className="text-sm text-red-600 font-medium">
                            {trend}% vs mois dernier
                        </span>
                    </>
                ) : (
                    <span className="text-sm text-gray-600">─ Stable</span>
                )}
            </div>
        </div>
    );
}