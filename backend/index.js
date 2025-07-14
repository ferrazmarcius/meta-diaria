require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const authMiddleware = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

const allowedOrigins = [
  'https://zenfinanc.com',
  'https://www.zenfinanc.com',
  'https://app.zenfinanc.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Insomnia, apps mobile) ou que estejam na lista.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

const dbPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Rota de verificação de saúde (Health Check) para o deploy.
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API do Meta Diária está no ar!'
  });
});

app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await dbPool.query(
      "INSERT INTO public.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, passwordHash]
    );

    const newUser = result.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === '23505') { // Chave duplicada (email já existe)
      return res.status(400).json({ error: 'Este email já está cadastrado.' });
    }
    console.error('Erro na rota de registro:', error);
    res.status(500).send('Erro no servidor ao tentar registrar usuário.');
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await dbPool.query("SELECT * FROM public.users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Erro na rota de login:', error);
    res.status(500).send('Erro no servidor ao tentar fazer login.');
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
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
});

app.post('/api/debts', authMiddleware, async (req, res) => {
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
    res.status(500).send('Erro no servidor ao tentar criar a meta de dívida.');
  }
});

app.post('/api/incomes', authMiddleware, async (req, res) => {
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
    res.status(500).send('Erro no servidor ao tentar registrar renda.');
  }
});

app.get('/api/debts/my-active-goal', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const result = await dbPool.query("SELECT * FROM public.debts WHERE user_id = $1 AND status = 'active' LIMIT 1", [userId]);

    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar meta ativa:', error);
    res.status(500).send('Erro no servidor ao tentar buscar a meta.');
  }
});

app.get('/api/incomes/:debtId', authMiddleware, async (req, res) => {
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
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});