import axios from 'axios';

const client = axios.create({
  baseURL: '/api', // Will be proxied to backend via Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
