import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.zenfinanc.com/api'
});

export default api;