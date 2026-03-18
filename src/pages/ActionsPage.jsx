import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActions, getActionsStats } from '../services/api';
import { removeToken } from '../services/auth';

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadActions();
    loadStats();
  }, []);

  const loadActions = async () => {
    try {
      setLoading(true);
      const response = await getAllActions(0, 100);
      setActions(response.data);
    } catch (error) {
      console.error('Erreur chargement actions:', error);
    } finally {
      setLoading(false);
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

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const filteredActions = actions.filter((action) => {
    if (filter === 'all') return true;
    if (filter === 'ai_nlp') return action.source === 'ai_nlp';
    if (filter === 'manual') return action.source === 'manual';
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critique':
        return 'bg-red-100 text-red-800';
      case 'Haute':
        return 'bg-orange-100 text-orange-800';
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-800';
      case 'Basse':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Maintenance':
        return '🔧';
      case 'Qualité':
        return '✅';
      case 'Sécurité':
        return '⚠️';
      case 'Formation':
        return '📚';
      case 'Organisation':
        return '📊';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Actions Correctives
            </h1>
            <p className="text-sm text-gray-600">
              Gestion et suivi des actions • Données réelles
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtrer :</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Toutes ({stats?.total || actions.length})
            </button>
            <button
              onClick={() => setFilter('ai_nlp')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'ai_nlp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              🤖 IA NLP ({stats?.ai_nlp || actions.filter((a) => a.source === 'ai_nlp').length})
            </button>
            <button
              onClick={() => setFilter('manual')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ✍️ Manuelles ({stats?.manual || actions.filter((a) => a.source === 'manual').length})
            </button>
          </div>
        </div>

        {/* Liste actions */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune action trouvée</p>
            <p className="text-gray-400 text-sm mt-2">
              Les actions générées par NLP apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getTypeIcon(action.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {action.titre}
                      </h3>
                      {action.source === 'ai_nlp' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          🤖 IA
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{action.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-medium ${getPriorityColor(
                          action.priorite
                        )}`}
                      >
                        {action.priorite}
                      </span>
                      <span className="text-gray-600">
                        Type : {action.type}
                      </span>
                      {action.responsable && (
                        <span className="text-gray-600">
                          👤 {action.responsable}
                        </span>
                      )}
                      {action.designation && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {action.designation}
                        </span>
                      )}
                    </div>

                    {action.ai_confidence && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Confiance IA :
                          </span>
                          <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${action.ai_confidence * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {(action.ai_confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${action.statut === 'ouverte'
                          ? 'bg-yellow-100 text-yellow-800'
                          : action.statut === 'en_cours'
                            ? 'bg-blue-100 text-blue-800'
                            : action.statut === 'fermee'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {action.statut}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats - 🆕 DONNÉES RÉELLES */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Actions
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.total}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Générées par IA
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.ai_nlp}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.taux_ai}% du total
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Priorité Haute/Critique
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {(stats.by_priority?.Haute || 0) + (stats.by_priority?.Critique || 0)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                En cours
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.by_status?.en_cours || 0}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}