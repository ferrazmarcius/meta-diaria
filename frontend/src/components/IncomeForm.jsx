import React, { useState } from 'react';
import axios from 'axios';

const IncomeForm = ({ debtId, onIncomeAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sessão expirada. Por favor, faça o login novamente.");
      setIsSubmitting(false);
      return;
    }

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Pensa-alto: Criamos o corpo da requisição juntando os dados do formulário
      // com o debtId que recebemos da página do Dashboard.
      const body = { ...formData, debt_id: debtId };

      const response = await axios.post('http://localhost:3001/api/incomes', body, config);

      alert('Ganho registrado com sucesso!');
      setFormData({ amount: '', source: '' }); // Limpa o formulário após o sucesso

      if (onIncomeAdded) {
        onIncomeAdded(response.data);
      }
    } catch (error) {
      console.error("Erro ao registrar ganho:", error.response?.data);
      alert(`Erro ao registrar ganho: ${error.response?.data?.error || 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
      <h3>Registrar Novo Ganho</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Valor Ganho:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            placeholder="Ex: 150.50"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="source">Fonte (opcional):</label>
          <input
            type="text"
            id="source"
            name="source"
            placeholder="Ex: Uber, Freelance"
            value={formData.source}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Adicionar Ganho'}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;