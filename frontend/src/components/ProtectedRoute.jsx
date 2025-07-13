import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente funciona como um "porteiro".
// Ele recebe uma propriedade chamada 'children'.
// 'children' será o componente que ele está protegendo (no nosso caso, a DashboardPage).
const ProtectedRoute = ({ children }) => {
  // Verifica no localStorage se o nosso token existe.
  const token = localStorage.getItem('token');

  // Se NÃO houver token...
  if (!token) {
    // ...usamos o componente <Navigate> do react-router-dom para redirecionar
    // o usuário para a página de login.
    // O atributo 'replace' impede que o usuário use o botão "voltar" do navegador
    // para burlar a proteção e acessar a página anterior.
    return <Navigate to="/login" replace />;
  }

  // Se houver um token, simplesmente renderiza o componente filho que ele está protegendo.
  // A passagem está liberada.
  return children;
};

export default ProtectedRoute;