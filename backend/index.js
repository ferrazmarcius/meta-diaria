const JWT = require('jsonwebtoken');
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const authMiddleware = require('./middleware/auth.js');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Rota de registro de usuário
app.post('/api/users/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este email já está cadastrado.' });
    }
    console.error('Erro na rota de registro:', error);
    res.status(500).send('Erro no servidor ao tentar registrar usuário.');
  }
});

// Rota de login de usuário
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const userResult = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const payload = { user: { id: user.id } };
    const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Erro na rota de login:', error);
    res.status(500).send('Erro no servidor ao tentar fazer login.');
  }
});

// Rota de perfil (protegida)
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, email, created_at FROM public.users WHERE id = $1", [req.user.id]);
    if (user.rows.length === 0) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro de Servidor');
  }
});

// ROTA PARA CRIAR UMA NOVA META DE DÍVIDA (protegida)
app.post('/api/debts', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { total_amount, target_date } = req.body;
  if (!total_amount || !target_date) {
    return res.status(400).json({ error: 'O valor total e a data alvo são obrigatórios.' });
  }
  try {
    const newDebt = await pool.query(
      "INSERT INTO public.debts (total_amount, target_date, user_id) VALUES ($1, $2, $3) RETURNING *",
      [total_amount, target_date, userId]
    );
    res.status(201).json(newDebt.rows[0]);
  } catch (error) {
    console.error('Erro ao criar meta de dívida:', error);
    res.status(500).send('Erro no servidor ao tentar criar a meta de dívida.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});