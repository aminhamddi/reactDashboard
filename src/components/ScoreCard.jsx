import React from 'react';

export default function ScoreCard({ plant, score, auditsCount, trend, target, stTarget, isLive }) {
    const getScoreColor = (score) => {
        if (score >= (stTarget || 95)) return 'text-green-700 bg-green-100';
        if (score >= (target || 85)) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getRankEmoji = (score) => {
        if (score >= (stTarget || 95)) return '🥇';
        if (score >= (target || 85)) return '🥈';
        return '🥉';
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
                {score >= (target || 85) && <span className="ml-2">{getRankEmoji(score)}</span>}
            </div>

            {/* Targets */}
            <div className="flex gap-4 mb-3">
                <div className="flex-1 text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className={`text-sm font-bold ${score >= (target || 85) ? 'text-green-600' : 'text-red-600'}`}>
                        {target || 85}%
                    </p>
                </div>
                <div className="flex-1 text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">ST Target</p>
                    <p className={`text-sm font-bold ${score >= (stTarget || 95) ? 'text-green-600' : 'text-red-600'}`}>
                        {stTarget || 95}%
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-gray-200 rounded-full mb-3">
                {/* Target marker */}
                <div className="absolute top-0 h-full border-r-2 border-yellow-500" style={{ left: `${target || 85}%` }}></div>
                {/* ST target marker */}
                <div className="absolute top-0 h-full border-r-2 border-green-500" style={{ left: `${stTarget || 95}%` }}></div>
                {/* Score fill */}
                <div
                    className={`h-full rounded-full ${score >= (stTarget || 95) ? 'bg-green-500' : score >= (target || 85) ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                ></div>
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