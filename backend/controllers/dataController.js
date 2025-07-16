const dbPool = require('../config/db');

exports.getUserProfile = async (req, res) => {
  try {
    const result = await dbPool.query("SELECT id, name, email, created_at FROM public.users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de Servidor');
  }
};

exports.createDebt = async (req, res) => {
    const { id: userId } = req.user;
    const { total_amount, target_date } = req.body;
    if (!total_amount || !target_date) {
        return res.status(400).json({ error: 'O valor total e a data alvo são obrigatórios.' });
    }
    try {
        const result = await dbPool.query(
            "INSERT INTO public.debts (total_amount, target_date, user_id) VALUES ($1, $2, $3) RETURNING *",
            [total_amount, target_date, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar meta de dívida:', error);
        res.status(500).send('Erro no servidor.');
    }
};

exports.getActiveDebt = async (req, res) => {
    const { id: userId } = req.user;
    try {
        const result = await dbPool.query("SELECT * FROM public.debts WHERE user_id = $1 AND status = 'active' LIMIT 1", [userId]);
        if (result.rows.length === 0) {
            return res.json(null);
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar meta ativa:', error);
        res.status(500).send('Erro no servidor.');
    }
};

exports.createIncome = async (req, res) => {
    const { id: userId } = req.user;
    const { amount, source, debt_id } = req.body;
    if (!amount || !debt_id) {
        return res.status(400).json({ error: 'O valor e o ID da meta são obrigatórios.' });
    }
    try {
        const debtCheckResult = await dbPool.query("SELECT id FROM public.debts WHERE id = $1 AND user_id = $2", [debt_id, userId]);
        if (debtCheckResult.rows.length === 0) {
            return res.status(403).json({ error: 'Acesso negado. Esta meta não pertence a você.' });
        }
        const result = await dbPool.query(
            "INSERT INTO public.incomes (amount, source, debt_id) VALUES ($1, $2, $3) RETURNING *",
            [amount, source, debt_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao registrar renda:', error);
        res.status(500).send('Erro no servidor.');
    }
};

exports.getIncomesForDebt = async (req, res) => {
    const { id: userId } = req.user;
    const { debtId } = req.params;
    try {
        const debtCheckResult = await dbPool.query("SELECT id FROM public.debts WHERE id = $1 AND user_id = $2", [debtId, userId]);
        if (debtCheckResult.rows.length === 0) {
            return res.status(403).json({ error: 'Acesso negado. Esta meta não pertence a você.' });
        }
        const result = await dbPool.query("SELECT * FROM public.incomes WHERE debt_id = $1 ORDER BY created_at DESC", [debtId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar rendas:', error);
        res.status(500).send('Erro no servidor.');
    }
};