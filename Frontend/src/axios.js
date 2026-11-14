import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const host = window.location.hostname || 'localhost';
  const port = window.location.port ? `:${window.location.port}` : '';

  return `${protocol}://${host}${port}`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || getDefaultApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
