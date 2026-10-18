
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export const errMsg = (e) =>
  e.response?.data?.message || e.message;

export const track = (event, ref) =>
  api.post('/analytics', { event, ref }).catch(() => {});
