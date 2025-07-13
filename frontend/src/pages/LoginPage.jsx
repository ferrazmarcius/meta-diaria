import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Importam o hook para navegação

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // 2. Inicializa o hook para poder usá-lo

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chama a rota de login que foi criada no back-end
      const response = await axios.post('http://localhost:3001/api/users/login', formData);

      // O back-end retorna um objeto com a chave 'token' se o login for bem-sucedido
      const { token } = response.data;

      console.log('Token recebido do login:', token);
      alert('Login realizado com sucesso!');

      // 3. Salva o token no localStorage do navegador.
      // localStorage é como uma "caixinha de armazenamento" simples do navegador.
      // É uma forma de "lembrar" do token entre as páginas.
      localStorage.setItem('token', token);

      // 4. Redireciona o usuário para a página do Dashboard (a rota "/") após o login
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