// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'; // 1. Importa o BrowserRouter
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envelopa o <App /> com o <BrowserRouter> */}
    {/* Isso "ativa" o poder de roteamento em todo o nosso aplicativo. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)