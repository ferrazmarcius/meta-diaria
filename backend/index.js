require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importa os arquivos de rotas
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// backend/index.js

const allowedOrigins = [
  // URLs de Produção
  'https://zenfinanc.com',
  'https://www.zenfinanc.com',
  'https://app.zenfinanc.com',
  
  // URL de Desenvolvimento Local
  'http://localhost:5173' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições se a origem estiver na lista ou se não houver origem (como no Insomnia)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  }
}));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API do Meta Diária está no ar!' });
});

// "Monta" as rotas nos seus respectivos caminhos base
app.use('/api/users', authRoutes); 
app.use('/api', dataRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});