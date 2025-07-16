import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/register', formData);
      alert('Usuário registrado com sucesso! Você será redirecionado.');
      navigate('/login');
    } catch (error) {
      alert('Erro ao registrar. O email já pode existir ou houve um problema no servidor.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Página de Registro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nome:</label>
          <input id="name" name="name" type="text" onChange={handleChange} value={formData.name} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" onChange={handleChange} value={formData.email} required />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input id="password" name="password" type="password" onChange={handleChange} value={formData.password} required />
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default RegisterPage;
