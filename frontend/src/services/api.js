import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ghargo-backend.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
//This is central axios instance. every API call in app will import this instead of writing axios.get('http://localhost:5000/...') repeatedly everywhere