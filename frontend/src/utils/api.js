import axios from 'axios';

const api = axios.create({
  baseURL: 'https://money-tracker-n1vp.onrender.com/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export const getSummary = async () => {
  const response = await api.get('/summary');
  return response.data;
};
export const getBudgets = async () => {
  const response = await api.get('/budgets');
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const addTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};
export const deleteTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};
export const updateTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};
export const createTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};
export const deleteBudget = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};
export const getGoals = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};
export const updateGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};
export const createGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};
export const deleteGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};
export default api;