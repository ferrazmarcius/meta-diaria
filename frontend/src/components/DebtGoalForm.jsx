import React, { useState } from 'react';
import axios from 'axios';

const DebtGoalForm = ({ onGoalSet }) => {
  const [formData, setFormData] = useState({
    total_amount: '',
    target_date: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===== INÍCIO DA LÓGICA DE SUBMISSÃO COMPLETA =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pensa-alto: Primeiro, pegamos o token que guardamos no localStorage durante o login.
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Você não está logado. Por favor, faça o login novamente.");
      return;
    }

    try {
      // Pensa-alto: Criamos um objeto de configuração para o axios,
      // adicionando o cabeçalho 'Authorization' com o nosso token no formato Bearer.
      // É assim que nosso back-end saberá quem está fazendo o pedido.
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Pensa-alto: Enviamos a requisição POST para a nossa API de 'debts', passando
      // os dados do formulário (formData) e o objeto de configuração com o token (config).
      const response = await axios.post('http://localhost:3001/api/debts', formData, config);
      
      console.log("Meta criada com sucesso:", response.data);
      alert("Sua meta foi salva com sucesso!");

      // No futuro, usaremos isso para avisar a página do Dashboard que a meta foi criada.
      if (onGoalSet) {
        onGoalSet(response.data);
      }

    } catch (error) {
      console.error("Erro ao criar meta:", error.response?.data);
      alert(`Erro ao salvar a meta: ${error.response?.data?.error || 'Tente novamente.'}`);
    }
  };
  // ===== FIM DA LÓGICA DE SUBMISSÃO =====

  return (
    <div>
      <h2>Defina Sua Meta de Quitação</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="total_amount">Valor Total da Dívida:</label>
          <input
            type="number"
            id="total_amount"
            name="total_amount"
            value={formData.total_amount}
            onChange={handleChange}
            required
            placeholder="Ex: 5000.00"
            step="0.01" // Permite casas decimais
          />
        </div>
        <div>
          <label htmlFor="target_date">Data Alvo:</label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Salvar Meta</button>
      </form>
    </div>
  );
};

export default DebtGoalForm;