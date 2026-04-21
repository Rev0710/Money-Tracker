import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://money-tracker-n1vp.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Summary
export const getSummary = async (month, year) => {
  const response = await api.get(`/summary?month=${month}&year=${year}`);
  return response.data;
};

// Transactions
export const getTransactions = async (params) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Budgets
export const getBudgets = async (month, year) => {
  const response = await api.get(`/budgets?month=${month}&year=${year}`);
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

// Goals
export const getGoals = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const createGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};

export const updateGoal = async (id, data) => {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};

export default api;