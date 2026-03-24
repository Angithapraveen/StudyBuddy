import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  maxBodyLength: 12 * 1024 * 1024,
  maxContentLength: 12 * 1024 * 1024,
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Use for toast copy: 413 and server messages */
export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  if (error.response?.status === 413) {
    return (
      error.response?.data?.message ||
      'File too large. Please upload a smaller file.'
    );
  }
  return error.response?.data?.message || error.message || fallback;
}

// AUTH
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (credentials) => api.post('/auth/register', credentials);

// PROCESSING
/** Fetches transcript only (backend uses youtube-transcript). */
export const fetchYoutubeTranscript = (url) => api.post('/transcript', { url });

/** Saves analysis; pass `transcript` from {@link fetchYoutubeTranscript} to avoid a second fetch. */
export const processYoutube = (url, transcript) =>
  api.post(
    '/process/youtube-summary',
    transcript != null && transcript !== '' ? { url, transcript } : { url }
  );

export const processUpload = (formData) => api.post('/process/doc-summary', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// MATERIALS
export const getMaterials = () => api.get('/materials');
export const getMaterialDetail = (id) => api.get(`/materials/${id}`);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

// CHAT
export const sendMessage = (uploadId, message) => api.post(`/chat/${uploadId}`, { message });
export const getChatHistory = (uploadId) => api.get(`/chat/${uploadId}`);

export default api;
