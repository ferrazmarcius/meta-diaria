const authMiddleware = require('./middleware/auth.js');
const JWT = require('jsonwebtoken');
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = 3001;

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
    // Mantemos o log de erro, que é importante.
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
    // Mantemos o log de erro, que é importante.
    console.error('Erro na rota de login:', error);
    res.status(500).send('Erro no servidor ao tentar fazer login.');
  }
});

// Pensa-alto: Aqui, estamos usando o middleware de autenticação que criamos.
// Ele vai verificar o token JWT antes de permitir o acesso à rota '/api/profile'.
// ===== ROTA PROTEGIDA DE EXEMPLO =====
// Pensa-alto: Para usar o middleware, nós o colocamos como um argumento
// entre o caminho da rota ('/api/profile') e o handler da rota final.
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    // Pensa-alto: Como o middleware já validou o token e adicionou o user.id ao 'req',
    // podemos usar o req.user.id com segurança para buscar os dados do usuário logado.
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

// Mantemos este log, pois ele confirma que o servidor subiu.
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});