const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('API do Meta Diária funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});