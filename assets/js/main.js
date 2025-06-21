// 🔗 Configure aqui o link da sua API
const API_URL = 'https://script.google.com/macros/s/AKfycbyyK01zS9CGJdb0ONaHcUAXp3Cp4Tz4BB5Hp85FdJxjx3zK4qZm7WGG4YzH3ugT5IE/exec';

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
  const res = await fetch(`${API_URL}?sheet=${sheet}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDelete(sheet, id) {
  const res = await fetch(`${API_URL}?sheet=${sheet}`, {
    method: 'POST',
    body: JSON.stringify({ id, action: 'delete' })
  });
  return await res.json();
}

// ✅ Renderiza o Dashboard e cria o canvas
function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Painel (Dashboard)</h2>
    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <canvas id="graficoComissoes"></canvas>
    </div>
  `;
  carregarDashboard();
}

// ✅ Dashboard
async function carregarDashboard() {
  const pagamentos = await apiGet('Pagamentos');
  const configuracoes = await apiGet('Configuracoes');

  const orcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')[1]) || 8000;

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
      <thead><tr><th>ID</th><th>Empresa</th><th>Fonte</th><th>Fase</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function novaOportunidade() {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');

  apiPost('Oportunidades', {
    id: '',
    empresa,
    fonte,
    fase
  }).then(() => renderOportunidades());
}

function editarOportunidade(id) {
  const empresa = prompt('Empresa:');
  const fonte = prompt('Fonte:');
  const fase = prompt('Fase do Funil:');

  apiPost('Oportunidades', {
    id,
    empresa,
    fonte,
    fase
  }).then(() => renderOportunidades());
}

function deletarOportunidade(id) {
  if (confirm('Deseja realmente excluir?')) {
    apiDelete('Oportunidades', id).then(() => renderOportunidades());
  }
}

// ✅ CRUD de Pagamentos
async function renderPagamentos() {
  const data = await apiGet('Pagamentos');
  const linhas = data.slice(1).map(p => `
    <tr>
      <td>${p[0]}</td>
      <td>${p[1]}</td>
      <td>${p[2]}</td>
      <td>${p[4]}</td>
      <td>${p[7]}</td>
      <td>${p[9]}</td>
      <td>
        <button class="btn" onclick="marcarRecebido(${p[0]})">✔️ Receber</button>
        <button class="btn btn-danger" onclick="deletarPagamento(${p[0]})">🗑️ Excluir</button>
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
  apiPost('Pagamentos', {
    id,
    status: 'Recebido'
  }).then(() => renderPagamentos());
}

function deletarPagamento(id) {
  if (confirm('Deseja excluir o pagamento?')) {
    apiDelete('Pagamentos', id).then(() => renderPagamentos());
  }
}

// ✅ CRUD de Despesas
async function renderDespesas() {
  const data = await apiGet('Despesas');
  const linhas = data.slice(1).map(d => `
    <tr>
      <td>${d[0]}</td>
      <td>${d[1]}</td>
      <td>${d[2]}</td>
      <td>${d[3]}</td>
      <td>${d[4]}</td>
      <td>
        <button class="btn btn-danger" onclick="deletarDespesa(${d[0]})">🗑️ Excluir</button>
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

  apiPost('Despesas', {
    id: '',
    descricao,
    categoria,
    valor,
    data
  }).then(() => renderDespesas());
}

function deletarDespesa(id) {
  if (confirm('Deseja excluir a despesa?')) {
    apiDelete('Despesas', id).then(() => renderDespesas());
  }
}

// ✅ Inicialização
window.addEventListener('load', () => {
  console.log('JS carregado');
  renderDashboard();
});
