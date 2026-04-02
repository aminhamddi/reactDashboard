import axios from 'axios';
import { getToken, removeToken } from './auth';

// Backend URL from env var — set VITE_API_URL=http://localhost:8000 for standalone dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Instance axios avec token
const api = axios.create({
    baseURL: API_URL,
});

// Intercepteur pour ajouter token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs 401 (token expiré/invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('Token expiré ou invalide, redirection vers login');
            removeToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===== AUTH =====
export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });

export const register = (userData) =>
    api.post('/api/auth/register', userData);

export const getCurrentUser = () =>
    api.get('/api/auth/me');

// ===== DASHBOARD =====
export const getDashboardStats = () =>
    api.get('/api/dashboard/stats');

export const getChartsData = (params) =>
    api.get('/api/dashboard/charts', { params });

export const getPlantsList = () =>
    api.get('/api/dashboard/plants');

export const getCategoryScores = () =>
    api.get('/api/dashboard/categories');

export const getHeatmapData = () =>
    api.get('/api/dashboard/heatmap');

export const getHeatmapData2 = () =>
    api.get('/api/dashboard/heatmapServices');

export const getPlantCategoryScores = (plant) =>
    api.get(`/api/dashboard/categories/${plant}`);

// ===== AUDITS =====
export const getAudits = (filters) =>
    api.get('/api/audits', { params: filters });

export const getAudit = (id) =>
    api.get(`/api/audits/${id}`);

export const createAudit = (data) =>
    api.post('/api/audits', data);

export const updateAudit = (id, data) =>
    api.put(`/api/audits/${id}`, data);

export const archiveAudit = (id) =>
    api.delete(`/api/audits/${id}`);

export const unarchiveAudit = (id) =>
    api.patch(`/api/audits/${id}/unarchive`);

export const finalizeAudit = (id) =>
    api.patch(`/api/audits/${id}/finalize`);

// ===== QUESTIONS =====
export const getQuestions = () =>
    api.get('/api/questions');

export const getCategories = () =>
    api.get('/api/questions/categories');

// ===== REPONSES =====
export const createReponse = (data) =>
    api.post('/api/reponses', data);

export const updateReponse = (id, data) =>
    api.put(`/api/reponses/${id}`, data);

// ===== ACTIONS =====
export const getActionsByAudit = (auditId) =>
    api.get(`/api/nlp/actions/${auditId}`);

export const getActionsByType = (auditId) =>
    api.get(`/api/nlp/actions/${auditId}/by-type`);

// Uses dashboard router (works even without NLP modules)
export const getAllActions = (skip = 0, limit = 100, dateFrom, dateTo, plantId, auditeurId, statut, type, priorite) => {
    const params = { skip, limit };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (plantId) params.plant_id = plantId;
    if (auditeurId) params.auditeur_id = auditeurId;
    if (statut) params.statut = statut;
    if (type) params.type = type;
    if (priorite) params.priorite = priorite;
    return api.get('/api/dashboard/actions/all', { params });
};

export const getActionsFilters = () =>
    api.get('/api/dashboard/actions/filters');

export const getActionsStats = () =>
    api.get('/api/dashboard/actions/stats');

export const getDeviationsByService = (plant) =>
    api.get('/api/dashboard/deviations/by-service', { params: plant ? { plant } : {} });

export const acceptAction = (id) =>
    api.patch(`/api/dashboard/actions/${id}/accept`);

export const closeAction = (id) =>
    api.patch(`/api/dashboard/actions/${id}/close`);

export const rejectAction = (id) =>
    api.patch(`/api/dashboard/actions/${id}/reject`);

// ===== ML =====
export const prioritizeAction = (actionId) =>
    api.post(`/api/ml/prioritize/${actionId}`);

export const getRecommendations = () =>
    api.get('/api/ml/recommend');

// ===== VISUALISATION =====
export const getSiteRanking = () =>
    api.get('/api/dashboard/ranking/site');

export const getProjectRanking = () =>
    api.get('/api/dashboard/ranking/project');

export const getServiceMatrix = () =>
    api.get('/api/dashboard/service-matrix');

export default api;
