import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import DebtGoalForm from '../components/DebtGoalForm';
import IncomeForm from '../components/IncomeForm';

function DashboardPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [debtGoal, setDebtGoal] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const [profileResponse, debtGoalResponse] = await Promise.all([
          api.get('/profile', config),
          api.get('/debts/my-active-goal', config)
        ]);

        setUserProfile(profileResponse.data);
        setDebtGoal(debtGoalResponse.data);

        if (debtGoalResponse.data) {
          const incomesResponse = await api.get(`/incomes/${debtGoalResponse.data.id}`, config);
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

  const handleIncomeAdded = (newIncome) => {
    setIncomes([newIncome, ...incomes]);
  };

  // ESTE BLOCO DE CÓDIGO É O QUE CALCULA O PROGRESSO
  // Ele provavelmente estava faltando ou incompleto no seu arquivo.
  const { totalEarned, remainingDebt, progressPercentage } = useMemo(() => {
    if (!debtGoal) return { totalEarned: 0, remainingDebt: 0, progressPercentage: 0 };

    const totalEarned = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    const remainingDebt = parseFloat(debtGoal.total_amount) - totalEarned;
    
    // Evita divisão por zero se a meta for 0
    const progressPercentage = debtGoal.total_amount > 0 
      ? (totalEarned / parseFloat(debtGoal.total_amount)) * 100 
      : 0;

    return { totalEarned, remainingDebt, progressPercentage };
  }, [incomes, debtGoal]);

  const handleGoalSet = (newGoal) => {
    // Atualiza o estado sem precisar recarregar a página
    setDebtGoal(newGoal);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {userProfile ? <h1>Dashboard de {userProfile.name}</h1> : <h1>Dashboard</h1>}
      <p>Bem-vindo ao seu painel principal!</p>
      <hr />
      
      {debtGoal ? (
        <div>
          <h2>Sua Meta Atual</h2>
          <p><strong>Meta:</strong> R$ {parseFloat(debtGoal.total_amount).toFixed(2)}</p>
          
          <h3>Progresso</h3>
          <progress value={progressPercentage} max="100"></progress> <span>{progressPercentage.toFixed(1)}%</span>
          <p><strong>Total Arrecadado:</strong> R$ {totalEarned.toFixed(2)}</p>
          <p><strong>Faltam:</strong> R$ {remainingDebt.toFixed(2)}</p>

          <IncomeForm debtId={debtGoal.id} onIncomeAdded={handleIncomeAdded} />
          
          <div style={{ marginTop: '20px' }}>
            <h3>Ganhos Registrados</h3>
            <ul>
              {incomes.map(income => (
                <li key={income.id}>
                  {new Date(income.created_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - R$ {parseFloat(income.amount).toFixed(2)} ({income.source || 'Sem fonte'})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <DebtGoalForm onGoalSet={handleGoalSet} />
      )}
    </div>
  );
}

export default DashboardPage;