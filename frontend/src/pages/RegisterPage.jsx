import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', // 1. Adiciona o campo 'name' ao nosso estado inicial
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
      // A chamada para a API agora enviará o objeto completo, incluindo o nome
      await axios.post('http://localhost:3001/api/users/register', formData);
      alert('Usuário registrado com sucesso! Você será redirecionado para o login.');
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro:', error.response.data);
      alert(`Erro no registro: ${error.response.data.error || 'Erro desconhecido'}`);
    }
  };

  return (
    <div>
      <h1>Página de Registro</h1>
      <form onSubmit={handleSubmit}>
        {/* 2. Adiciona o campo de input para o Nome */}
        <div>
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
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
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default RegisterPage;