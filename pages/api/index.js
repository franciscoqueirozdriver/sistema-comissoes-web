const express = require('express');
const app = express();
const port = 3000;

// Middleware para JSON
app.use(express.json());

// Endpoint básico para testar
app.get('/', (req, res) => {
  res.send('API de Comissões funcionando 🚀');
});

// Teste se a API de Configurações responde
app.get('/api/configuracoes', (req, res) => {
  res.json({ mensagem: 'API de Configurações funcionando!' });
});

// (Opcional: adicione outras rotas depois)

// Start do servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
