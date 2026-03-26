// src/utils/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15_000,
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Something went wrong';
    // Don't toast on 401 — the auth hook handles redirect
    if (err.response?.status !== 401) {
      toast.error(msg);
    }
    return Promise.reject(err);
  }
);

export default api;
