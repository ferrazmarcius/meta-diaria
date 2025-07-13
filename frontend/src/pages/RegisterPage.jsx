import React, { useState } from 'react'; // 1. Importando o useState do React
import axios from 'axios';                   // 2. Importando o axios para falar com a API

function RegisterPage() {
  // 3. Criando um "estado" para guardar os dados do formulário
  // formData é um objeto que guarda os valores. setFormData é a função para atualizá-los.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 4. Função para lidar com a mudança nos campos de input
  // Esta função é chamada toda vez que o usuário digita algo.
  const handleChange = (e) => {
    // Ela atualiza o estado 'formData' com o novo valor do campo que foi modificado.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 5. Função para lidar com o envio do formulário
  // Esta função é chamada quando o usuário clica no botão "Registrar".
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento padrão da página ao submeter.

    try {
      // 6. Faz a chamada para a API usando axios
      // axios.post envia os dados do estado 'formData'
      // para a rota de registro do backend.
      const response = await axios.post('http://localhost:3001/api/users/register', formData);

      // 7. Lida com a resposta de sucesso
      console.log('Resposta do registro:', response.data);
      alert('Usuário registrado com sucesso!');
      // No futuro, aqui redirecionará o usuário para a página de login.

    } catch (error) {
      // 8. Lidando com a resposta de erro:
      console.error('Erro no registro:', error.response.data);
      // Mostra a mensagem de erro que a API enviou (ex: "Este email já está cadastrado.")
      alert(`Erro no registro: ${error.response.data.error || 'Erro desconhecido'}`);
    }
  };

  return (
    <div>
      <h1>Página de Registro</h1>
      {/* 9. Nosso formulário em JSX */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email" // O 'name' tem que ser igual à chave no estado formData
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
            name="password" // O 'name' tem que ser igual à chave no estado formData
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