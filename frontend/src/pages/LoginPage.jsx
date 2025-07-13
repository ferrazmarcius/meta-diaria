import React, { useState } from 'react';
import api from '../api'; // Correto! Já está usando nossa API central.
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ===== A ÚNICA MUDANÇA É AQUI =====
      // Corrigimos o endpoint para chamar a rota de login
      const response = await api.post('/users/login', formData);

      const { token } = response.data;

      console.log('Token recebido do login:', token);
      alert('Login realizado com sucesso!');

      localStorage.setItem('token', token);

      navigate('/');

    } catch (error) {
      console.error('Erro no login:', error.response.data);
      alert(`Erro no login: ${error.response.data.error || 'Credenciais inválidas'}`);
    }
  };

  return (
    <div>
      <h1>Página de Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;