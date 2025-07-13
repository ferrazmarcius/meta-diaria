import axios from 'axios';

const api = axios.create({
  // Este é o endereço final do seu back-end na internet,
  // que o seu site irá usar depois de publicado.
  baseURL: 'https://api.zenfinanc.com/api'
});

export default api;