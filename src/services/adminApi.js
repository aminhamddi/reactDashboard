// dashboard-web/src/services/adminApi.js
import api from './api';

// ===== QUESTIONS =====
export const getQuestions = () =>
    api.get('/api/questions');

export const getQuestion = (id) =>
    api.get(`/api/questions/${id}`);

export const createQuestion = (data) =>
    api.post('/api/questions', data);

export const updateQuestion = (id, data) =>
    api.put(`/api/questions/${id}`, data);

export const deleteQuestion = (id) =>
    api.delete(`/api/questions/${id}`);

// ===== USERS =====
export const getUsers = () =>
    api.get('/api/users');

export const getUser = (id) =>
    api.get(`/api/users/${id}`);

export const createUser = (data) =>
    api.post('/api/auth/register', data);

export const updateUser = (id, data) =>
    api.put(`/api/users/${id}`, data);

export const deleteUser = (id) =>
    api.delete(`/api/users/${id}`);

export const toggleUserStatus = (id) =>
    api.patch(`/api/users/${id}/toggle-status`);

// ===== CATEGORIES =====
export const getCategories = () =>
    api.get('/api/questions/categories');

export const createCategory = (data) =>
    api.post('/api/categories', data);

export const updateCategory = (id, data) =>
    api.put(`/api/categories/${id}`, data);

export const deleteCategory = (id) =>
    api.delete(`/api/categories/${id}`);

// ===== GRAVITES =====
export const getGravites = () =>
    api.get('/api/questions/gravites');

export const createGravite = (data) =>
    api.post('/api/gravites', data);

export const updateGravite = (id, data) =>
    api.put(`/api/gravites/${id}`, data);

export const deleteGravite = (id) =>
    api.delete(`/api/gravites/${id}`);

// ===== SERVICES =====
export const getServices = () =>
    api.get('/api/services');

export const createService = (data) =>
    api.post('/api/services', data);

export const updateService = (id, data) =>
    api.put(`/api/services/${id}`, data);

export const deleteService = (id) =>
    api.delete(`/api/services/${id}`);

// ===== PLANTS =====
export const getPlants = () =>
    api.get('/api/plants');

export const createPlant = (data) =>
    api.post('/api/plants', data);

export const updatePlant = (id, data) =>
    api.put(`/api/plants/${id}`, data);

export const deletePlant = (id) =>
    api.delete(`/api/plants/${id}`);

// ===== PROJECTS =====
export const getProjects = () =>
    api.get('/api/projects');

export const createProject = (data) =>
    api.post('/api/projects', data);

export const updateProject = (id, data) =>
    api.put(`/api/projects/${id}`, data);

export const deleteProject = (id) =>
    api.delete(`/api/projects/${id}`);

export default {
    getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getUsers, createUser, updateUser, deleteUser, toggleUserStatus,
    getCategories, createCategory, updateCategory, deleteCategory,
    getGravites, createGravite, updateGravite, deleteGravite,
    getServices, createService, updateService, deleteService,
    getPlants, createPlant, updatePlant, deletePlant,
    getProjects, createProject, updateProject, deleteProject,
};