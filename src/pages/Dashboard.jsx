import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    getDashboardStats,
    getChartsData,
    getCategoryScores,
    getHeatmapData,
    getSiteRanking,
    getProjectRanking,
    getServiceMatrix,
    getActionsStats,
    getDeviationsByService,
    getAllPlantsHistory,
    getAllProjectsHistory,
    getServicesByPlantHistory,
    getServicesByProjectHistory,
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
import {
    BarChart as RechartsBar,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from 'recharts';


export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [chartsData, setChartsData] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [siteRanking, setSiteRanking] = useState([]);
    const [projectRanking, setProjectRanking] = useState([]);
    const [serviceMatrix, setServiceMatrix] = useState(null);
    const [actionsStats, setActionsStats] = useState(null);
    const [deviationsByService, setDeviationsByService] = useState(null);
    const [plantsHistory, setPlantsHistory] = useState([]);
    const [projectsHistory, setProjectsHistory] = useState([]);
    const [servicesByPlant, setServicesByPlant] = useState([]);
    const [servicesByProject, setServicesByProject] = useState([]);
    const [chartMonths, setChartMonths] = useState(6);
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
                console.log('🚨 AUDIT_FINALIZED détecté dans Dashboard:', data);
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

    // Ref pour toujours avoir la dernière valeur de chartMonths
    const chartMonthsRef = useRef(chartMonths);
    chartMonthsRef.current = chartMonths;

    // Charge les charts mensuels (plants, projects, services)
    const loadMonthlyCharts = useCallback(async () => {
        try {
            const months = chartMonthsRef.current;
            const [plantsRes, projectsRes, servicesPlantRes, servicesProjectRes] = await Promise.all([
                getAllPlantsHistory(months),
                getAllProjectsHistory(months),
                getServicesByPlantHistory(months),
                getServicesByProjectHistory(months),
            ]);
            setPlantsHistory(plantsRes.data.plants || []);
            setProjectsHistory(projectsRes.data.projects || []);
            setServicesByPlant(servicesPlantRes.data.plants || []);
            setServicesByProject(servicesProjectRes.data.projects || []);
        } catch (err) {
            console.error('❌ Erreur chargement charts mensuels:', err);
        }
    }, []);

    // Recharge les charts mensuels quand la période change
    useEffect(() => {
        loadMonthlyCharts();
    }, [chartMonths, loadMonthlyCharts]);

    const loadData = async () => {
        try {
            setLoading(true);

            // CHARGER TOUTES LES DONNÉES (sans les charts mensuels)
            const [statsRes, chartsRes, categoryRes, heatmapRes, siteRankRes, projectRankRes, serviceMatrixRes, actionsStatsRes, deviationsRes] = await Promise.all([
                getDashboardStats(),
                getChartsData({ months: 6 }),
                getCategoryScores(),
                getHeatmapData(),
                getSiteRanking(),
                getProjectRanking(),
                getServiceMatrix(),
                getActionsStats().catch(() => ({ data: { total: 0, total_nlp: 0, par_statut: {}, par_type: {}, par_priorite: {} } })),
                getDeviationsByService().catch(() => ({ data: { services: [], total: 0 } })),
            ]);

            setStats(statsRes.data);
            setChartsData(chartsRes.data);

            setRadarData(categoryRes.data);
            setHeatmapData(heatmapRes.data);
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
                    target: plant.target,
                    st_target: plant.st_target,
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

    // Charger les charts mensuels après le chargement initial
    useEffect(() => {
        if (!loading) {
            loadMonthlyCharts();
        }
    }, [loading]);

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

                {/* ===== VISUALISATION RÉSULTAT D'AUDIT (from Excel) ===== */}

                {/* Classement Site & Projet */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <SiteRanking data={siteRanking.length > 0 ? siteRanking : []} />
                    {projectRanking.length > 0 && <ProjectRanking data={projectRanking} />}
                </div>

                {/* Service × Site Matrix */}
                {serviceMatrix && <ServiceSiteMatrix data={serviceMatrix} />}

                {/* ===== PLANTS MONTHLY BARS ===== */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Scores Mensuels par Plant</h2>
                        <select
                            value={chartMonths}
                            onChange={(e) => {
                                setChartMonths(parseInt(e.target.value));
                                loadData();
                            }}
                            className="px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                            <option value={3}>3 mois</option>
                            <option value={6}>6 mois</option>
                            <option value={12}>12 mois</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {plantsHistory.map((plant) => (
                            <PlantMonthlyBar key={plant.name} plant={plant} />
                        ))}
                    </div>
                </div>

                {/* ===== PROJECTS MONTHLY BARS ===== */}
                {projectsHistory.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Scores Mensuels par Projet</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {projectsHistory.map((project) => (
                                <ProjectMonthlyBar key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== RESULTS PAR SERVICE BY PLANT ===== */}
                {servicesByPlant.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Résultats par Service - Plants (%)</h2>
                            <select
                                value={chartMonths}
                                onChange={(e) => {
                                    setChartMonths(parseInt(e.target.value));
                                }}
                                className="px-3 py-2 border rounded-lg text-sm bg-white"
                            >
                                <option value={1}>1 mois</option>
                                <option value={2}>2 mois</option>
                                <option value={3}>3 mois</option>
                                <option value={6}>6 mois</option>
                                <option value={12}>12 mois</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {servicesByPlant.map((plant) => (
                                <ServicePlantChart key={plant.name} plant={plant} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== RESULTS PAR SERVICE BY PROJECT ===== */}
                {servicesByProject.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Résultats par Service - Projets (%)</h2>
                            <span className="text-sm text-gray-500">
                                Période: {chartMonths} mois
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {servicesByProject.map((project) => (
                                <ServiceProjectChart key={project.name} project={project} />
                            ))}
                        </div>
                    </div>
                )}

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

// ===== HELPER COMPONENTS =====

const getScoreColor = (score, target = 85, stTarget = 95) => {
    if (score >= stTarget) return '#22c55e';
    if (score >= target) return '#eab308';
    return '#ef4444';
};

const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${monthNames[parseInt(month) - 1]}`;
};

function PlantMonthlyBar({ plant }) {
    const chartData = plant.months.map((m) => ({
        month: formatMonth(m.month),
        score: m.score,
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700 text-sm">{plant.name}</h4>
                <div className="flex gap-3 text-xs">
                    <span className="text-gray-500">Target: <span className="font-medium text-yellow-600">{plant.target}%</span></span>
                    <span className="text-gray-500">ST: <span className="font-medium text-green-600">{plant.st_target}%</span></span>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
                <RechartsBar data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                        formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <ReferenceLine y={plant.target} stroke="#eab308" strokeDasharray="3 3" />
                    <ReferenceLine y={plant.st_target} stroke="#22c55e" strokeDasharray="3 3" />
                    <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(entry.score, plant.target, plant.st_target)} />
                        ))}
                    </Bar>
                </RechartsBar>
            </ResponsiveContainer>
        </div>
    );
}

function ProjectMonthlyBar({ project }) {
    const chartData = project.months.map((m) => ({
        month: formatMonth(m.month),
        score: m.score,
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700 text-sm">{project.name}</h4>
                <span className="text-xs text-gray-500">Target: <span className="font-medium text-yellow-600">{project.target}%</span></span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
                <RechartsBar data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                        formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <ReferenceLine y={project.target} stroke="#eab308" strokeDasharray="3 3" />
                    <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(entry.score, project.target, 100)} />
                        ))}
                    </Bar>
                </RechartsBar>
            </ResponsiveContainer>
        </div>
    );
}

// Service by Plant Chart - Grouped bar chart showing all services for a plant
function ServicePlantChart({ plant }) {
    if (!plant.services || plant.services.length === 0) {
        return null;
    }

    // Prepare data for grouped bars
    const months = plant.services[0]?.months || [];
    const chartData = months.map((m, idx) => {
        const row = { month: formatMonth(m.month) };
        plant.services.forEach((service) => {
            row[service.name] = service.months[idx]?.score || 0;
        });
        return row;
    });

    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700 text-sm">{plant.name}</h4>
                <span className="text-xs text-gray-500">{plant.services.length} services</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <RechartsBar data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px' }}
                        formatter={(value, name) => [`${value}%`, name]}
                    />
                    <ReferenceLine y={85} stroke="#eab308" strokeDasharray="3 3" />
                    <ReferenceLine y={95} stroke="#22c55e" strokeDasharray="3 3" />
                    {plant.services.map((service, idx) => (
                        <Bar
                            key={service.name}
                            dataKey={service.name}
                            fill={colors[idx % colors.length]}
                            radius={[2, 2, 0, 0]}
                        />
                    ))}
                </RechartsBar>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {plant.services.map((service, idx) => (
                    <div key={service.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                        <span className="text-xs text-gray-600">{service.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Service by Project Chart - Grouped bar chart showing all services for a project
function ServiceProjectChart({ project }) {
    if (!project.services || project.services.length === 0) {
        return null;
    }

    // Prepare data for grouped bars
    const months = project.services[0]?.months || [];
    const chartData = months.map((m, idx) => {
        const row = { month: formatMonth(m.month) };
        project.services.forEach((service) => {
            row[service.name] = service.months[idx]?.score || 0;
        });
        return row;
    });

    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700 text-sm">{project.name}</h4>
                <span className="text-xs text-gray-500">{project.services.length} services</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
                <RechartsBar data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px' }}
                        formatter={(value, name) => [`${value}%`, name]}
                    />
                    <ReferenceLine y={85} stroke="#eab308" strokeDasharray="3 3" />
                    <ReferenceLine y={95} stroke="#22c55e" strokeDasharray="3 3" />
                    {project.services.map((service, idx) => (
                        <Bar
                            key={service.name}
                            dataKey={service.name}
                            fill={colors[idx % colors.length]}
                            radius={[2, 2, 0, 0]}
                        />
                    ))}
                </RechartsBar>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {project.services.map((service, idx) => (
                    <div key={service.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                        <span className="text-xs text-gray-600">{service.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
