import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActions, getActionsStats, getActionsFilters, acceptAction, closeAction, rejectAction } from '../services/api';
import { removeToken } from '../services/auth';

// Format ISO date to DD/MM/YYYY HH:mm
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get YYYY-MM-DD for a date offset from today
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ plants: [], auditeurs: [], types: [], priorites: [] });
  const [filtersError, setFiltersError] = useState(false);

  // Filter state
  const [plantId, setPlantId] = useState('');
  const [auditeurId, setAuditeurId] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load filters and stats once on mount
  useEffect(() => {
    loadFilters();
    loadStats();
  }, []);

  // Auto-apply when any filter changes (like Audits page)
  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllActions(
        0, 500,
        dateFrom || undefined,
        dateTo || undefined,
        plantId || undefined,
        auditeurId || undefined,
        statutFilter || undefined,
        typeFilter || undefined,
        prioriteFilter || undefined
      );
      setActions(response.data);
    } catch (error) {
      console.error('Erreur chargement actions:', error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, plantId, auditeurId, statutFilter, typeFilter, prioriteFilter]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const loadFilters = async () => {
    try {
      const response = await getActionsFilters();
      setFilterOptions(response.data);
      setFiltersError(false);
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
      setFiltersError(true);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getActionsStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleResetFilters = () => {
    setPlantId('');
    setAuditeurId('');
    setStatutFilter('');
    setTypeFilter('');
    setPrioriteFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const handleQuickDate = (from, to) => {
    setDateFrom(from || '');
    setDateTo(to || '');
  };

  const handleAccept = async (id) => {
    try {
      await acceptAction(id);
      loadActions();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.detail || "Erreur lors de l'acceptation");
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Clôturer cette action ?')) return;
    try {
      await closeAction(id);
      loadActions();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de la clôture');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rejeter cette action ?')) return;
    try {
      await rejectAction(id);
      loadActions();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors du rejet');
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critique': return 'bg-red-100 text-red-800';
      case 'Haute': return 'bg-orange-100 text-orange-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'ouverte': return 'bg-yellow-100 text-yellow-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'fermee': return 'bg-green-100 text-green-800';
      case 'rejetee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Maintenance': return '🔧';
      case 'Qualité': return '✅';
      case 'Sécurité': return '⚠️';
      case 'Formation': return '📚';
      case 'Organisation': return '📊';
      default: return '📋';
    }
  };

  const hasActiveFilters = plantId || auditeurId || statutFilter || typeFilter || prioriteFilter || dateFrom || dateTo;

  // Resolve filter label from value
  const plantLabel = plantId ? (filterOptions.plants.find(p => p.id == plantId)?.nom || plantId) : '';
  const auditeurLabel = auditeurId ? (filterOptions.auditeurs.find(a => a.id == auditeurId)?.nom || auditeurId) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Actions Correctives</h1>
            <p className="text-sm text-gray-600">Gestion et suivi des actions</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">← Dashboard</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <div className="bg-yellow-50 rounded-lg shadow p-4"><p className="text-xs text-gray-500">Ouvertes</p><p className="text-2xl font-bold text-yellow-600">{stats.par_statut?.ouverte || 0}</p></div>
            <div className="bg-blue-50 rounded-lg shadow p-4"><p className="text-xs text-gray-500">En cours</p><p className="text-2xl font-bold text-blue-600">{stats.par_statut?.en_cours || 0}</p></div>
            <div className="bg-green-50 rounded-lg shadow p-4"><p className="text-xs text-gray-500">Clôturées</p><p className="text-2xl font-bold text-green-600">{stats.par_statut?.fermee || 0}</p></div>
            <div className="bg-red-50 rounded-lg shadow p-4"><p className="text-xs text-gray-500">Rejetées</p><p className="text-2xl font-bold text-red-600">{stats.par_statut?.rejetee || 0}</p></div>
          </div>
        )}

        {/* Filters error warning */}
        {filtersError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-2">
            <span className="text-red-600 text-sm font-medium">Impossible de charger les options de filtre.</span>
            <button onClick={loadFilters} className="text-sm text-red-700 underline hover:no-underline">Réessayer</button>
          </div>
        )}

        {/* Filters bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
            {/* Plant */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Usine</label>
              <select value={plantId} onChange={(e) => setPlantId(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1">
                <option value="">Toutes les usines</option>
                {filterOptions.plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            {/* Auditeur */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Auditeur</label>
              <select value={auditeurId} onChange={(e) => setAuditeurId(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1">
                <option value="">Tous les auditeurs</option>
                {filterOptions.auditeurs.map((a) => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Statut</label>
              <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1">
                <option value="">Tous les statuts</option>
                <option value="ouverte">🟡 Ouverte</option>
                <option value="en_cours">🔵 En cours</option>
                <option value="fermee">🟢 Clôturée</option>
                <option value="rejetee">🔴 Rejetée</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1">
                <option value="">Tous les types</option>
                {(filterOptions.types.length > 0 ? filterOptions.types : ['Maintenance', 'Qualité', 'Sécurité', 'Formation', 'Organisation']).map((t) => (
                  <option key={t} value={t}>{getTypeIcon(t)} {t}</option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Priorité</label>
              <select value={prioriteFilter} onChange={(e) => setPrioriteFilter(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1">
                <option value="">Toutes les priorités</option>
                {(filterOptions.priorites.length > 0 ? filterOptions.priorites : ['Critique', 'Haute', 'Moyenne', 'Basse']).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Au</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleQuickDate(dateOffset(0), dateOffset(0))} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">Aujourd'hui</button>
              <button onClick={() => handleQuickDate(dateOffset(7), '')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">7 jours</button>
              <button onClick={() => handleQuickDate(dateOffset(30), '')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">30 jours</button>
            </div>

            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition ml-auto">Réinitialiser</button>
            )}
          </div>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Filtres actifs :</span>
            {plantId && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Usine: {plantLabel}</span>}
            {auditeurId && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Auditeur: {auditeurLabel}</span>}
            {statutFilter && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Statut: {statutFilter}</span>}
            {typeFilter && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Type: {typeFilter}</span>}
            {prioriteFilter && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Priorité: {prioriteFilter}</span>}
            {dateFrom && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Du: {dateFrom}</span>}
            {dateTo && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Au: {dateTo}</span>}
          </div>
        )}

        {/* Action count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{actions.length}</span> action{actions.length !== 1 ? 's' : ''} trouvée{actions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Action list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune action trouvée</p>
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="mt-4 text-blue-600 text-sm hover:underline">Réinitialiser les filtres</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {actions.map((action) => (
              <div key={action.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(action.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{action.titre}</h3>
                      {action.source === 'ai_nlp' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">IA</span>
                      )}
                    </div>

                    {/* Date + Plant + Auditeur */}
                    <div className="flex flex-wrap items-center gap-4 text-xs mb-3">
                      <span className="text-gray-400">📅 {formatDate(action.created_at)}</span>
                      {action.plant_name && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium">🏭 {action.plant_name}</span>}
                      {action.auditeur_name && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded font-medium">👤 {action.auditeur_name}</span>}
                    </div>

                    <p className="text-gray-600 mb-4">{action.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${getPriorityColor(action.priorite)}`}>{action.priorite}</span>
                      <span className="text-gray-600">Type : {action.type}</span>
                      {action.responsable && <span className="text-gray-600">👤 {action.responsable}</span>}
                      {action.designation && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{action.designation}</span>}
                    </div>

                    {action.ai_confidence && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confiance IA :</span>
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${action.ai_confidence * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">{(action.ai_confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Status + buttons */}
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(action.statut)}`}>
                      {action.statut === 'ouverte' && 'Ouverte'}
                      {action.statut === 'en_cours' && 'En cours'}
                      {action.statut === 'fermee' && 'Clôturée'}
                      {action.statut === 'rejetee' && 'Rejetée'}
                    </span>

                    {action.statut === 'ouverte' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleAccept(action.id)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition font-medium">✅ Accepter</button>
                        <button onClick={() => handleReject(action.id)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition font-medium">❌ Rejeter</button>
                      </div>
                    )}

                    {action.statut === 'en_cours' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleClose(action.id)} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 transition font-medium">✅ Clôturer</button>
                        <button onClick={() => handleReject(action.id)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition font-medium">❌ Rejeter</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
