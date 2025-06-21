// 🔗 Configure aqui o link da sua API
const API_URL = 'https://script.google.com/macros/s/SEU_CODIGO_AQUI/exec';

// ✅ Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// ✅ Funções Genéricas da API
async function apiGet(sheet) {
  const res = await fetch(`${API_URL}?sheet=${sheet}`);
  return await res.json();
}

async function apiPost(sheet, data) {
  await fetch(`${API_URL}`, {
    method: 'POST',
    body: JSON.stringify({ sheet, ...data })
  });
}

async function apiDelete(sheet, id) {
  await fetch(`${API_URL}`, {
    method: 'POST',
    body: JSON.stringify({ sheet, id, action: 'delete' })
  });
}

// ✅ Função de Dashboard
async function carregarDashboard() {
  const pagamentos = await apiGet('Pagamentos');
  const configuracoes = await apiGet('Configuracoes');

  const orcado = parseFloat(configuracoes.find(c => c[0] === 'orcado_mensal')?.[1] || 8000);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);
  const previsto = new Array(12).fill(orcado);

  pagamentos.slice(1).forEach(p => {
    const data = new Date(p[7]);
    if (!isNaN(data)) {
      const mes = data.getMonth();
      const status = p[9];
      const valor = parseFloat(p[4]);
      if (status === 'Recebido') {
        realizado[mes] += valor;
      }
    }
  });

  const ctx = document.getElementById('graficoComissoes').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Realizado',
          data: realizado,
          backgroundColor: 'rgba(139, 92, 246, 0.7)'
        },
        {
          type: 'line',
          label: 'Orçado',
          data: previsto,
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ✅ CRUD de Oportunidades
async function renderOportunidades() {
  const data = await apiGet('Oportunidades');
  const linhas = data.slice(1).map(o => `
    <tr>
      <td>${o[0]}</td>
      <td>${o[1]}</td>
      <td>${o[2]}</td>
      <td>${o[3]}</td>
      <td>${o[4]}</td>
      <td>${o[5]}</td>
      <td>${o[6]}</td>
      <td>${o[7]}</td>
      <td>${o[8]}</td>
      <td>${o[9]}</td>
      <td>${o[10]}</td>
      <td>${o[11]}</td>
      <td>${o[12]}</td>
      <td>
        <button class="btn" onclick="editarOportunidade(${o[0]})">✏️ Editar</button>
        <button class="btn btn-danger" onclick="deletarOportunidade(${o[0]})">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Oportunidades</h2>
    <button class="btn mb-2" onclick="novaOportunidade()">+ Nova Oportunidade</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Empresa</th><th>Fonte</th><th>Fase do Funil</th>
          <th>Data Entrada</th><th>Previsão Fechamento</th><th>Valor Implantação</th><th>Parcelas Implantação</th>
          <th>Valor Mensalidade</th><th>Qtde Mensalidades</th><th>Data 1º Pgto Mensal</th><th>% Imposto</th><th>Observação</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function novaOportunidade() {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');
  const data_entrada = prompt('Data de Entrada (AAAA-MM-DD):');
  const previsao_fechamento = prompt('Previsão de Fechamento (AAAA-MM-DD):');
  const valor_implantacao = prompt('Valor da Implantação:');
  const parcelas_implantacao = prompt('Parcelas da Implantação:');
  const valor_mensalidade = prompt('Valor da Mensalidade:');
  const qtde_mensalidades = prompt('Quantidade de Mensalidades:');
  const data_primeiro_pagamento_mensal = prompt('Data do 1º Pagamento Mensal (AAAA-MM-DD):');
  const percentual_imposto = prompt('% Imposto (ex.: 0.19):');
  const observacao = prompt('Observação:');

  apiPost('Oportunidades', {
    id: '',
    empresa,
    fonte,
    fase_do_funil: fase,
    data_entrada,
    previsao_fechamento,
    valor_implantacao,
    parcelas_implantacao,
    valor_mensalidade,
    qtde_mensalidades,
    data_primeiro_pagamento_mensal,
    percentual_imposto,
    observacao
  }).then(() => renderOportunidades());
}

function editarOportunidade(id) {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');
  const data_entrada = prompt('Data de Entrada (AAAA-MM-DD):');
  const previsao_fechamento = prompt('Previsão de Fechamento (AAAA-MM-DD):');
  const valor_implantacao = prompt('Valor da Implantação:');
  const parcelas_implantacao = prompt('Parcelas da Implantação:');
  const valor_mensalidade = prompt('Valor da Mensalidade:');
  const qtde_mensalidades = prompt('Quantidade de Mensalidades:');
  const data_primeiro_pagamento_mensal = prompt('Data do 1º Pagamento Mensal (AAAA-MM-DD):');
  const percentual_imposto = prompt('% Imposto (ex.: 0.19):');
  const observacao = prompt('Observação:');

  apiPost('Oportunidades', {
    id,
    empresa,
    fonte,
    fase_do_funil: fase,
    data_entrada,
    previsao_fechamento,
    valor_implantacao,
    parcelas_implantacao,
    valor_mensalidade,
    qtde_mensalidades,
    data_primeiro_pagamento_mensal,
    percentual_imposto,
    observacao
  }).then(() => renderOportunidades());
}

function deletarOportunidade(id) {
  if (confirm('Deseja realmente excluir?')) {
    apiDelete('Oportunidades', id).then(() => renderOportunidades());
  }
}

// ✅ Inicialização
window.addEventListener('load', () => {
  console.log('JS carregado');
  carregarDashboard();
});
