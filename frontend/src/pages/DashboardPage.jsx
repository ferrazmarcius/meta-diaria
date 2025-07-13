import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DebtGoalForm from '../components/DebtGoalForm';
import IncomeForm from '../components/IncomeForm';

function DashboardPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [debtGoal, setDebtGoal] = useState(null);
  // 1. Novo estado para guardar a lista de ganhos
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. O useEffect agora busca TUDO que o dashboard precisa
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      try {
        const profileResponse = await axios.get('http://localhost:3001/api/profile', config);
        setUserProfile(profileResponse.data);

        const debtGoalResponse = await axios.get('http://localhost:3001/api/debts/my-active-goal', config);
        setDebtGoal(debtGoalResponse.data);

        // Se uma meta de dívida foi encontrada, buscamos os ganhos associados a ela
        if (debtGoalResponse.data) {
          const incomesResponse = await axios.get(`http://localhost:3001/api/incomes/${debtGoalResponse.data.id}`, config);
          setIncomes(incomesResponse.data);
        }

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Esta função será chamada pelo IncomeForm quando um novo ganho for adicionado
  const handleIncomeAdded = (newIncome) => {
    // Adicionamos o novo ganho à nossa lista de ganhos no estado,
    // fazendo com que a tela se atualize instantaneamente!
    setIncomes([newIncome, ...incomes]);
  };

  // 4. Cálculos em tempo real para o progresso
  const { totalEarned, remainingDebt, progressPercentage } = useMemo(() => {
    if (!debtGoal) return { totalEarned: 0, remainingDebt: 0, progressPercentage: 0 };

    const totalEarned = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    const remainingDebt = parseFloat(debtGoal.total_amount) - totalEarned;
    const progressPercentage = (totalEarned / parseFloat(debtGoal.total_amount)) * 100;

    return { totalEarned, remainingDebt, progressPercentage };
  }, [incomes, debtGoal]);


  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {userProfile ? <h1>Dashboard de {userProfile.name}</h1> : <h1>Dashboard</h1>}
      <hr />
      
      {debtGoal ? (
        <div>
          <h2>Sua Meta Atual</h2>
          <p><strong>Meta:</strong> R$ {parseFloat(debtGoal.total_amount).toFixed(2)}</p>
          
          {/* 5. Exibição do Progresso */}
          <h3>Progresso</h3>
          <progress value={progressPercentage} max="100"></progress> <span>{progressPercentage.toFixed(1)}%</span>
          <p><strong>Total Arrecadado:</strong> R$ {totalEarned.toFixed(2)}</p>
          <p><strong>Faltam:</strong> R$ {remainingDebt.toFixed(2)}</p>

          {/* 6. Formulário e Lista de Ganhos */}
          <IncomeForm debtId={debtGoal.id} onIncomeAdded={handleIncomeAdded} />
          
          <div style={{ marginTop: '20px' }}>
            <h3>Ganhos Registrados</h3>
            <ul>
              {incomes.map(income => (
                <li key={income.id}>
                  {new Date(income.created_at).toLocaleDateString('pt-BR')} - R$ {parseFloat(income.amount).toFixed(2)} ({income.source || 'Sem fonte'})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <DebtGoalForm onGoalSet={(newGoal) => window.location.reload()} />
      )}
    </div>
  );
}

export default DashboardPage;