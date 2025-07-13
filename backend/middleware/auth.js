const jwt = require('jsonwebtoken');

// O middleware é apenas uma função que recebe req, res, e next.
// 'next' é uma função que chamamos para "passar para o próximo estágio" (a rota final).
module.exports = function(req, res, next) {
  // O padrão é enviar o token no cabeçalho (header) 'Authorization' no formato 'Bearer SEU_TOKEN'.
  // Primeiro, pegamos o token do cabeçalho da requisição.
  const authHeader = req.header('Authorization');

  // Se não houver nenhum cabeçalho de autorização, a porta está fechada.
  // Retorna um erro 401 (não autorizado) com uma mensagem amigável.
  if (!authHeader) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  try {
    // O header vem como "Bearer token". Usa apenas a parte do token.
    const token = authHeader.split(' ')[1];

    // Se não houver token depois de 'Bearer', a porta está fechada.
    if (!token) {
        return res.status(401).json({ msg: 'Formato de token inválido, autorização negada.' });
    }

    // Agora, verifica se o crachá é válido usando nosso segredo.
    // jwt.verify vai dar erro se o token for inválido ou expirado.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se o crachá for válido, 'decoded' conterá o payload (com o id do usuário).
    // Anexa essa informação do usuário ao objeto da requisição (req).
    // Assim, a rota final saberá QUEM está fazendo a requisição.
    req.user = decoded.user;

    // Deu tudo certo, libera a passagem para a rota final.
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token não é válido.' });
  }
};