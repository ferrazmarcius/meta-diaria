import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      alert('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      alert('Erro no login: Credenciais inválidas ou problema no servidor.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Página de Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" onChange={handleChange} value={formData.email} required />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input id="password" name="password" type="password" onChange={handleChange} value={formData.password} required />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;