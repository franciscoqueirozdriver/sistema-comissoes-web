console.log('JS carregado');

const API_BASE = 'https://sistema-comissoes-web.vercel.app/api';

// 🌙 Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// 🔗 Funções API
async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  return await res.json();
}

async function apiPost(endpoint, data) {
  await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function apiDelete(endpoint, id) {
  await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'delete' })
  });
}

// 🚀 Dashboard
async function renderDashboard() {
  const pagamentos = await apiGet('pagamentos');
  const configuracoes = await apiGet('configuracoes');

  const orcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')[1]) || 8000;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);
  const previsto = new Array(12).fill(orcado);

  pagamentos.slice(1).forEach(p => {
    const data = new Date(p[6]);
    if (!isNaN(data)) {
      const mes = data.getMonth();
      const status = p[7];
      const valor = parseFloat(p[3]);
      if (status === 'Recebido') {
        realizado[mes] += valor;
      }
    }
  });

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Dashboard</h2>
    <canvas id="graficoComissoes"></canvas>
  `;

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
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 🚀 Oportunidades
async function renderOportunidades() {
  const data = await apiGet('oportunidades');
  const linhas = data.slice(1).map(o => `
    <tr>
      <td>${o[0]}</td>
      <td>${o[1]}</td>
      <td>${o[2]}</td>
      <td>${o[3]}</td>
      <td>
        <button class="btn" onclick="editarOportunidade('${o[0]}')">✏️ Editar</button>
        <button class="btn btn-danger" onclick="deletarOportunidade('${o[0]}')">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Oportunidades</h2>
    <button class="btn mb-2" onclick="novaOportunidade()">+ Nova Oportunidade</button>
    <table>
      <thead><tr><th>ID</th><th>Empresa</th><th>Fonte</th><th>Fase</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function novaOportunidade() {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');
  apiPost('oportunidades', { id: '', empresa, fonte, fase_do_funil: fase }).then(() => renderOportunidades());
}

function editarOportunidade(id) {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');
  apiPost('oportunidades', { id, empresa, fonte, fase_do_funil: fase }).then(() => renderOportunidades());
}

function deletarOportunidade(id) {
  if (confirm('Deseja excluir?')) {
    apiDelete('oportunidades', id).then(() => renderOportunidades());
  }
}

// 🚀 Pagamentos
async function renderPagamentos() {
  const data = await apiGet('pagamentos');
  const linhas = data.slice(1).map(p => `
    <tr>
      <td>${p[0]}</td>
      <td>${p[1]}</td>
      <td>${p[2]}</td>
      <td>${p[3]}</td>
      <td>${p[6]}</td>
      <td>${p[7]}</td>
      <td>
        <button class="btn" onclick="marcarRecebido('${p[0]}')">✔️ Receber</button>
        <button class="btn btn-danger" onclick="deletarPagamento('${p[0]}')">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Pagamentos</h2>
    <table>
      <thead><tr><th>ID</th><th>Empresa</th><th>Tipo</th><th>Valor</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function marcarRecebido(id) {
  apiPost('pagamentos', { id, status: 'Recebido' }).then(() => renderPagamentos());
}

function deletarPagamento(id) {
  if (confirm('Deseja excluir o pagamento?')) {
    apiDelete('pagamentos', id).then(() => renderPagamentos());
  }
}

// 🚀 Despesas
async function renderDespesas() {
  const data = await apiGet('despesas');
  const linhas = data.slice(1).map(d => `
    <tr>
      <td>${d[0]}</td>
      <td>${d[1]}</td>
      <td>${d[2]}</td>
      <td>${d[3]}</td>
      <td>${d[4]}</td>
      <td>
        <button class="btn btn-danger" onclick="deletarDespesa('${d[0]}')">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Despesas</h2>
    <button class="btn mb-2" onclick="novaDespesa()">+ Nova Despesa</button>
    <table>
      <thead><tr><th>ID</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function novaDespesa() {
  const descricao = prompt('Descrição:');
  const categoria = prompt('Categoria:');
  const valor = prompt('Valor:');
  const data = prompt('Data (AAAA-MM-DD):');
  apiPost('despesas', { id: '', descricao, categoria, valor, data }).then(() => renderDespesas());
}

function deletarDespesa(id) {
  if (confirm('Deseja excluir a despesa?')) {
    apiDelete('despesas', id).then(() => renderDespesas());
  }
}

// Inicialização
window.addEventListener('load', renderDashboard);

