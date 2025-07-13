const jwt = require('jsonwebtoken');

// Pensa-alto: O middleware é apenas uma função que recebe req, res, e next.
// 'next' é uma função que chamamos para "passar para o próximo estágio" (a rota final).
module.exports = function(req, res, next) {
  // Pensa-alto: O padrão é enviar o token no cabeçalho (header) 'Authorization' no formato 'Bearer SEU_TOKEN'.
  // Primeiro, pegamos o token do cabeçalho da requisição.
  const authHeader = req.header('Authorization');

  // Pensa-alto: Se não houver nenhum cabeçalho de autorização, barramos na porta.
  if (!authHeader) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  try {
    // Pensa-alto: O header vem como "Bearer token". Queremos apenas a parte do token.
    const token = authHeader.split(' ')[1];

    // Pensa-alto: Se não houver token depois de 'Bearer', barramos na porta.
    if (!token) {
        return res.status(401).json({ msg: 'Formato de token inválido, autorização negada.' });
    }

    // Pensa-alto: Agora, verificamos se o crachá é válido usando nosso segredo.
    // jwt.verify vai dar erro se o token for inválido ou expirado.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pensa-alto: Se o crachá for válido, 'decoded' conterá nosso payload (com o id do usuário).
    // Anexamos essa informação do usuário ao objeto da requisição (req).
    // Assim, a rota final saberá QUEM está fazendo a requisição.
    req.user = decoded.user;
    
    // Pensa-alto: Deu tudo certo, liberamos a passagem para a rota final.
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token não é válido.' });
  }
};