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

// Rota de registro de usuário ATUALIZADA
app.post('/api/users/register', async (req, res) => {
  // 1. Agora também pegamos o 'name' do corpo da requisição
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // 2. Adicionamos 'name' à query SQL e aos parâmetros
    const newUser = await pool.query(
      "INSERT INTO public.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, passwordHash]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    // ...código de erro permanece o mesmo...
    if (error.code === '23505') { /* ... */ }
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

// Rota de perfil (protegida) ATUALIZADA
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    // 1. Adicionamos 'name' na lista de colunas a serem selecionadas
    const user = await pool.query("SELECT id, name, email, created_at FROM public.users WHERE id = $1", [req.user.id]);

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

// ===== ROTA PARA REGISTRAR UMA NOVA RENDA (GANHO) =====
// Rota protegida, pois um ganho sempre pertence a um usuário logado e a uma meta específica.
app.post('/api/incomes', authMiddleware, async (req, res) => {
  // O ID do usuário vem do token JWT, garantido pelo nosso middleware.
  const userId = req.user.id;

  // O front-end nos enviará o valor, a fonte (opcional) e a qual meta este ganho pertence (debt_id).
  const { amount, source, debt_id } = req.body;

  // Validação básica
  if (!amount || !debt_id) {
    return res.status(400).json({ error: 'O valor e o ID da meta são obrigatórios.' });
  }

  try {
    // Pensa-alto: Verificação de segurança crucial!
    // Antes de inserir o ganho, checamos se a meta (debt_id) realmente pertence ao usuário (userId)
    // que está fazendo a requisição. Isso impede que um usuário adicione ganhos à meta de outro.
    const debtCheck = await pool.query(
      "SELECT id FROM public.debts WHERE id = $1 AND user_id = $2",
      [debt_id, userId]
    );

    if (debtCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Esta meta não pertence a você.' });
    }

    // Se a checagem passou, inserimos a nova renda na tabela 'incomes'.
    const newIncome = await pool.query(
      "INSERT INTO public.incomes (amount, source, debt_id) VALUES ($1, $2, $3) RETURNING *",
      [amount, source, debt_id]
    );

    res.status(201).json(newIncome.rows[0]);

  } catch (error) {
    console.error('Erro ao registrar renda:', error);
    res.status(500).send('Erro no servidor ao tentar registrar renda.');
  }
});

// ===== ROTA PARA BUSCAR A META ATIVA DO USUÁRIO LOGADO =====
app.get('/api/debts/my-active-goal', authMiddleware, async (req, res) => {
  // O ID do usuário vem do token, garantido pelo nosso middleware.
  const userId = req.user.id;

  try {
    // Faz uma busca na tabela 'debts' filtrando pelo ID do usuário
    // e pelo status 'active'. Usamos LIMIT 1 porque, por enquanto, cada usuário só pode ter uma meta ativa.
    const debtResult = await pool.query(
      "SELECT * FROM public.debts WHERE user_id = $1 AND status = 'active' LIMIT 1",
      [userId]
    );

    // Se a busca não retornar nenhuma linha, significa que este usuário não tem uma meta ativa.
    // Retorna 'null' para que o front-end saiba que precisa mostrar o formulário de criação.
    if (debtResult.rows.length === 0) {
      return res.json(null);
    }

    // Se encontrar uma meta, retorna os dados dela.
    res.json(debtResult.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar meta ativa:', error);
    res.status(500).send('Erro no servidor ao tentar buscar a meta.');
  }
});

// ===== ROTA PARA BUSCAR TODOS OS GANHOS DE UMA META =====
// Pensa-alto: Usamos ':debtId' como um "parâmetro de rota". Isso significa que a URL
// terá o ID da dívida, como /api/incomes/8.
app.get('/api/incomes/:debtId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  // Pegamos o ID da dívida que veio como parâmetro na URL.
  const { debtId } = req.params;

  try {
    // A mesma verificação de segurança de antes: esta meta pertence a este usuário?
    const debtCheck = await pool.query(
      "SELECT id FROM public.debts WHERE id = $1 AND user_id = $2",
      [debtId, userId]
    );

    if (debtCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Esta meta não pertence a você.' });
    }

    // Se a checagem passar, buscamos todos os ganhos associados a essa meta,
    // ordenados do mais recente para o mais antigo.
    const incomesResult = await pool.query(
      "SELECT * FROM public.incomes WHERE debt_id = $1 ORDER BY created_at DESC",
      [debtId]
    );

    // Retornamos um array (uma lista) com todos os ganhos encontrados.
    res.json(incomesResult.rows);

  } catch (error) {
    console.error('Erro ao buscar rendas:', error);
    res.status(500).send('Erro no servidor.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});