import axios from 'axios';

const isProduction = import.meta.env.PROD;

const baseURL = isProduction
  ? 'https://api.zenfinanc.com/api' // URL de Produção
  : 'http://localhost:3001/api';    // URL de Desenvolvimento Local

const api = axios.create({
  baseURL: baseURL
});

console.log(`API Client inicializado para o ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}. URL Base: ${baseURL}`);

export default api;