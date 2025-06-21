// 🔗 API
const API_URL = 'https://SEU_LINK_DA_API/exec';

// 🔥 Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// 🚀 Funções API
async function apiGet(sheet) {
  const res = await fetch(`${API_URL}?sheet=${sheet}`);
  return await res.json();
}

async function apiPost(sheet, data) {
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, ...data })
  });
}

async function apiDelete(sheet, id) {
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, id, action: 'delete' })
  });
}

// 🏠 Dashboard
async function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Dashboard</h2>
    <canvas id="graficoComissoes"></canvas>
  `;
  carregarDashboard();
}

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

// 🎯 CRUD Oportunidades com Formulário
async function renderOportunidades() {
  const data = await apiGet('Oportunidades');
  const linhas = data.slice(1).map(o => `
    <tr>
      <td>${o[0]}</td>
      <td>${o[1]}</td>
      <td>${o[2]}</td>
      <td>${o[3]}</td>
      <td>
        <button class="btn" onclick="editarOportunidade(${o[0]}, '${o[1]}', '${o[2]}', '${o[3]}')">✏️ Editar</button>
        <button class="btn btn-danger" onclick="deletarOportunidade(${o[0]})">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Oportunidades</h2>
    <button class="btn mb-4" onclick="novaOportunidade()">+ Nova Oportunidade</button>
    <table class="w-full table-auto border">
      <thead><tr><th>ID</th><th>Empresa</th><th>Fonte</th><th>Fase</th><th>Ações</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function novaOportunidade() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl mb-4">Nova Oportunidade</h2>
    <div class="grid gap-4">
      <input type="text" id="empresa" placeholder="Empresa">
      <input type="text" id="fonte" placeholder="Fonte">
      <input type="text" id="fase" placeholder="Fase do Funil">
      <div class="flex gap-2">
        <button class="btn" onclick="salvarNovaOportunidade()">Salvar</button>
        <button class="btn btn-danger" onclick="renderOportunidades()">Cancelar</button>
      </div>
    </div>
  `;
}

function salvarNovaOportunidade() {
  const empresa = document.getElementById('empresa').value;
  const fonte = document.getElementById('fonte').value;
  const fase = document.getElementById('fase').value;

  apiPost('Oportunidades', { id: '', empresa, fonte, fase })
    .then(() => renderOportunidades());
}

function editarOportunidade(id, empresa, fonte, fase) {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl mb-4">Editar Oportunidade</h2>
    <div class="grid gap-4">
      <input type="text" id="empresa" value="${empresa}" placeholder="Empresa">
      <input type="text" id="fonte" value="${fonte}" placeholder="Fonte">
      <input type="text" id="fase" value="${fase}" placeholder="Fase do Funil">
      <div class="flex gap-2">
        <button class="btn" onclick="salvarEdicaoOportunidade(${id})">Salvar</button>
        <button class="btn btn-danger" onclick="renderOportunidades()">Cancelar</button>
      </div>
    </div>
  `;
}

function salvarEdicaoOportunidade(id) {
  const empresa = document.getElementById('empresa').value;
  const fonte = document.getElementById('fonte').value;
  const fase = document.getElementById('fase').value;

  apiPost('Oportunidades', { id, empresa, fonte, fase })
    .then(() => renderOportunidades());
}

function deletarOportunidade(id) {
  if (confirm('Deseja realmente excluir essa oportunidade?')) {
    apiDelete('Oportunidades', id).then(() => renderOportunidades());
  }
}

// 🟢 Inicialização
window.addEventListener('load', renderDashboard);
