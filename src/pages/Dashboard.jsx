import React, { useEffect, useState } from 'react';
import {
    getDashboardStats,
    getChartsData,
    getCategoryScores,
    getHeatmapData,
    getHeatmapData2,
    getSiteRanking,
    getProjectRanking,
    getServiceMatrix,
    getActionsStats,
    getDeviationsByService,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { removeToken, getUser } from '../services/auth';
import wsService from '../services/websocket';
import { getToken } from '../services/auth';
import ScoreCard from '../components/ScoreCard';
import LineChart from '../components/LineChart';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import Heatmap from '../components/Heatmap';
import SiteRanking from '../components/SiteRanking';
import ProjectRanking from '../components/ProjectRanking';
import ServiceSiteMatrix from '../components/ServiceSiteMatrix';


export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [chartsData, setChartsData] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [heatmapDataSercice, setHeatmapDataService] = useState([])
    const [siteRanking, setSiteRanking] = useState([]);
    const [projectRanking, setProjectRanking] = useState([]);
    const [serviceMatrix, setServiceMatrix] = useState(null);
    const [actionsStats, setActionsStats] = useState(null);
    const [deviationsByService, setDeviationsByService] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [lastUpdatedPlant, setLastUpdatedPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = getUser();
    const canAccessAdmin = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        loadData();

        // WebSocket temps réel
        const token = getToken();
        if (token) {
            wsService.connect(token);

            const handleAuditFinalized = (data) => {
                console.log('Nouvel audit:', data);
                setIsLive(true);
                setLastUpdatedPlant(data.plant);
                setTimeout(() => {
                    setIsLive(false);
                    setLastUpdatedPlant(null);
                }, 3000);
                loadData(); // Refresh données
            };

            wsService.on('auditFinalized', handleAuditFinalized);

            return () => {
                wsService.off('auditFinalized', handleAuditFinalized);
                wsService.disconnect();
            };
        }
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // CHARGER TOUTES LES DONNÉES
            const [statsRes, chartsRes, categoryRes, heatmapRes, heatmapResService, siteRankRes, projectRankRes, serviceMatrixRes, actionsStatsRes, deviationsRes] = await Promise.all([
                getDashboardStats(),
                getChartsData({ months: 6 }),
                getCategoryScores(),
                getHeatmapData(),
                getHeatmapData2(),
                getSiteRanking(),
                getProjectRanking(),
                getServiceMatrix(),
                getActionsStats().catch(() => ({ data: { total: 0, total_nlp: 0, par_statut: {}, par_type: {}, par_priorite: {} } })),
                getDeviationsByService().catch(() => ({ data: { services: [], total: 0 } })),
            ]);

            console.log('📊 Stats reçues:', statsRes.data);
            console.log('📈 Charts reçus:', chartsRes.data);

            setStats(statsRes.data);
            setChartsData(chartsRes.data);

            setRadarData(categoryRes.data);
            setHeatmapData(heatmapRes.data);
            setHeatmapDataService(heatmapResService.data);
            setSiteRanking(siteRankRes.data);
            setProjectRanking(projectRankRes.data);
            setServiceMatrix(serviceMatrixRes.data);
            setActionsStats(actionsStatsRes.data);
            setDeviationsByService(deviationsRes.data);

            // Bar chart depuis stats RÉELLES
            if (statsRes.data.plants && statsRes.data.plants.length > 0) {
                const barChartData = statsRes.data.plants.map((plant) => ({
                    name: plant.name,
                    score: plant.score,
                    audits: plant.audits_count,
                }));
                setBarData(barChartData);
            }

            setError('');
        } catch (err) {
            console.error('❌ Erreur chargement:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        wsService.disconnect();
        removeToken();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des données réelles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <div className="text-red-600 text-center mb-4 text-2xl">⚠️</div>
                    <div className="text-red-600 text-center mb-4 font-semibold">
                        {error}
                    </div>
                    <p className="text-gray-600 text-center mb-4 text-sm">
                        Assurez-vous que le backend est lancé sur http://localhost:8000
                    </p>
                    <button
                        onClick={loadData}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard OEE Audit
                        </h1>
                        <p className="text-sm text-gray-600">
                            Vue d'ensemble temps réel • Données réelles
                            {user && <span className="ml-2">• {user.nom}</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/audits')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Audits
                        </button>
                        <button
                            onClick={() => navigate('/actions')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            Actions
                        </button>
                        {canAccessAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                👨‍💼 Admin
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Stats globales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Total Audits
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {stats?.total_audits_month || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Ce mois</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Score Moyen
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {stats?.average_score || 0}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Global</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Plants Actifs
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {stats?.plants?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Usines</p>
                    </div>
                </div>

                {/* Score Cards par Plant */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats?.plants?.map((plant) => (
                        <ScoreCard
                            key={plant.name}
                            plant={plant.name}
                            score={plant.score}
                            auditsCount={plant.audits_count}
                            trend={plant.trend}
                            target={plant.target}
                            stTarget={plant.st_target}
                            isLive={isLive && plant.name === lastUpdatedPlant}
                        />
                    ))}
                </div>

                {/* Graphique Ligne */}
                {chartsData.length > 0 && (
                    <div className="mb-8">
                        <LineChart data={chartsData} />
                    </div>
                )}

                {/* Graphiques avancés */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Bar Chart */}
                    {barData.length > 0 && <BarChart data={barData} />}

                    {/* Radar Chart - DONNÉES RÉELLES */}
                    {radarData.length > 0 && <RadarChart data={radarData} />}
                </div>

                {/* Heatmap - Catégorie */}
                {heatmapData.length > 0 && (
                    <div className="mb-8">
                        <Heatmap data={heatmapData} tb={"Catégorie"} />
                    </div>
                )}
                {/* Heatmap - Service */}
                {heatmapDataSercice.length > 0 && (
                    <div className="mb-8">
                        <Heatmap data={heatmapDataSercice} tb={"Service"} />
                    </div>
                )}

                {/* ===== VISUALISATION RÉSULTAT D'AUDIT (from Excel) ===== */}

                {/* Classement Site & Projet */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {siteRanking.length > 0 && <SiteRanking data={siteRanking} />}
                    {projectRanking.length > 0 && <ProjectRanking data={projectRanking} />}
                </div>

                {/* Service × Site Matrix */}
                {serviceMatrix && <ServiceSiteMatrix data={serviceMatrix} />}

                {/* Déviations par Service */}
                {deviationsByService && deviationsByService.total > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Déviations par Service ({deviationsByService.total} total)</h2>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Service</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Total</th>
                                        <th className="px-4 py-3 text-center font-medium text-green-700">AA</th>
                                        <th className="px-4 py-3 text-center font-medium text-yellow-700">DMI</th>
                                        <th className="px-4 py-3 text-center font-medium text-red-700">DMA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {deviationsByService.services.filter(s => s.total > 0).map((s) => (
                                        <tr key={s.service} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{s.service}</td>
                                            <td className="px-4 py-3 text-center font-bold">{s.total}</td>
                                            <td className="px-4 py-3 text-center text-green-600">{s.AA || '—'}</td>
                                            <td className="px-4 py-3 text-center text-yellow-600">{s.DMI || '—'}</td>
                                            <td className="px-4 py-3 text-center text-red-600">{s.DMA || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Actions Correctives NLP */}
                {actionsStats && actionsStats.total > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Actions Correctives (NLP)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500">Total Actions</p>
                                <p className="text-2xl font-bold">{actionsStats.total}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500">Générées par NLP</p>
                                <p className="text-2xl font-bold text-blue-600">{actionsStats.total_nlp}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{(actionsStats.par_statut?.ouverte || 0)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500">En cours</p>
                                <p className="text-2xl font-bold text-green-600">{(actionsStats.par_statut?.en_cours || 0)}</p>
                            </div>
                        </div>
                        {actionsStats.par_type && Object.keys(actionsStats.par_type).length > 0 && (
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500 mb-3">Répartition par type</p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(actionsStats.par_type).filter(([,v]) => v > 0).map(([type, count]) => (
                                        <span key={type} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                                            {type}: <strong>{count}</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {actionsStats.par_priorite && Object.keys(actionsStats.par_priorite).filter(([,v]) => v > 0).length > 0 && (
                            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500 mb-3">Par priorité (Critique/Haute importantes)</p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                        Critique: <strong>{actionsStats.par_priorite.Critique || 0}</strong>
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                                        Haute: <strong>{actionsStats.par_priorite.Haute || 0}</strong>
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                                        Moyenne: <strong>{actionsStats.par_priorite.Moyenne || 0}</strong>
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                        Basse: <strong>{actionsStats.par_priorite.Basse || 0}</strong>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
