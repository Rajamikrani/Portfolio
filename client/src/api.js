import axios from 'axios';
export const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`, withCredentials: true });
export const errMsg = (e) => e.response?.data?.message || e.message;
export const track = (event, ref) => api.post('/analytics', { event, ref }).catch(() => {});
