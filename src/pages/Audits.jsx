import React, { useEffect, useState } from 'react';
import { getAudits, updateAudit, archiveAudit, unarchiveAudit } from '../services/api';
import { getUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';

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

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ===== EDIT MODAL =====
function EditModal({ audit, onClose, onSave }) {
  const [form, setForm] = useState({
    date_audit: audit.date_audit || '',
    heure_debut: audit.heure_debut || '',
    heure_fin: audit.heure_fin || '',
    score_global: audit.score_global ? (audit.score_global * 100).toFixed(2) : '',
    commentaire_global: audit.commentaire_global || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        date_audit: form.date_audit,
        heure_debut: form.heure_debut || null,
        heure_fin: form.heure_fin || null,
        commentaire_global: form.commentaire_global || null,
      };
      if (form.score_global !== '' && form.score_global !== null) {
        data.score_global = parseFloat(form.score_global) / 100;
      }
      await onSave(data);
      onClose();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Modifier l'audit #{audit.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date_audit} onChange={(e) => setForm({ ...form, date_audit: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.score_global} onChange={(e) => setForm({ ...form, score_global: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="ex: 85.50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
              <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
              <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea rows={3} value={form.commentaire_global} onChange={(e) => setForm({ ...form, commentaire_global: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function Audits() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingAudit, setEditingAudit] = useState(null);
  const navigate = useNavigate();
  const user = getUser();
  const canManage = user && (user.role === 'admin' || user.role === 'manager');

  useEffect(() => {
    loadAudits();
  }, [statusFilter, dateFrom, dateTo]);

  const loadAudits = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.statut = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const response = await getAudits(params);
      setAudits(response.data);
    } catch (error) {
      console.error('Erreur chargement audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (from, to) => {
    setDateFrom(from || '');
    setDateTo(to || '');
  };

  const handleArchive = async (audit) => {
    if (!window.confirm(`Archiver l'audit #${audit.id} ?`)) return;
    try {
      await archiveAudit(audit.id);
      loadAudits();
    } catch (error) {
      alert(error.response?.data?.detail || "Erreur lors de l'archivage");
    }
  };

  const handleUnarchive = async (audit) => {
    if (!window.confirm(`Restaurer l'audit #${audit.id} en brouillon ?`)) return;
    try {
      await unarchiveAudit(audit.id);
      loadAudits();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de la restauration');
    }
  };

  const handleEditSave = async (data) => {
    await updateAudit(editingAudit.id, data);
    loadAudits();
  };

  const getStatusBadge = (statut) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      finalized: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    const labels = { draft: 'Brouillon', finalized: 'Finalisé', archived: 'Archivé' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statut] || 'bg-gray-100 text-gray-800'}`}>{labels[statut] || statut}</span>;
  };

  const getScoreDisplay = (score) => {
    if (!score && score !== 0) return <span className="text-gray-400">—</span>;
    const pct = score * 100;
    const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-orange-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{pct.toFixed(1)}%</span>;
  };

  const counts = {
    all: audits.length,
    draft: audits.filter((a) => a.statut === 'draft').length,
    finalized: audits.filter((a) => a.statut === 'finalized').length,
    archived: audits.filter((a) => a.statut === 'archived').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Audits</h1>
            <p className="text-sm text-gray-600">{audits.length} audit(s)</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">← Dashboard</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Date filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">📅 Période :</span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => handleDateFilter(e.target.value, dateTo)} className="border rounded-lg px-3 py-1.5 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Au</label>
              <input type="date" value={dateTo} onChange={(e) => handleDateFilter(dateFrom, e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
            </div>
            <div className="flex gap-2 ml-2">
              <button onClick={() => handleDateFilter(dateOffset(0), dateOffset(0))} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">Aujourd'hui</button>
              <button onClick={() => handleDateFilter(dateOffset(7), '')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">7 jours</button>
              <button onClick={() => handleDateFilter(dateOffset(30), '')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition">30 jours</button>
              <button onClick={() => handleDateFilter('', '')} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">Tout</button>
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: '', label: 'Tous', count: audits.length },
            { key: 'draft', label: 'Brouillons', count: counts.draft },
            { key: 'finalized', label: 'Finalisés', count: counts.finalized },
            { key: 'archived', label: 'Archivés', count: counts.archived },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === tab.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : audits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun audit trouvé</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  {canManage && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{audit.id}</td>
                    <td className="px-6 py-4 text-sm">{audit.plant?.nom || '—'}</td>
                    <td className="px-6 py-4 text-sm">{audit.date_audit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{audit.auditeur?.nom || `#${audit.auditeur_id}`}</td>
                    <td className="px-6 py-4 text-sm">{getScoreDisplay(audit.score_global)}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(audit.statut)}</td>
                    {canManage && (
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {audit.statut === 'draft' && (
                            <>
                              <button onClick={() => setEditingAudit(audit)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200" title="Modifier">Modifier</button>
                              <button onClick={() => handleArchive(audit)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200" title="Archiver">Archiver</button>
                            </>
                          )}
                          {audit.statut === 'archived' && (
                            <button onClick={() => handleUnarchive(audit)} className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200" title="Restaurer">Restaurer</button>
                          )}
                          {audit.statut === 'finalized' && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {editingAudit && <EditModal audit={editingAudit} onClose={() => setEditingAudit(null)} onSave={handleEditSave} />}
    </div>
  );
}
