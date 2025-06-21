// 🔗 Link da API
const API_URL = 'https://script.google.com/macros/s/AKfycbyyK01zS9CGJdb0ONaHcUAXp3Cp4Tz4BB5Hp85FdJxjx3zK4qZm7WGG4YzH3ugT5IE/exec';


// ✅ Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// ✅ API Funções
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

// ✅ Renderiza Lista de Oportunidades
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
        <button class="btn" onclick="abrirModalOportunidade(${o[0]})">✏️ Editar</button>
        <button class="btn btn-danger" onclick="deletarOportunidade(${o[0]})">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Oportunidades</h2>
    <button class="btn mb-2" onclick="abrirModalOportunidade()">+ Nova Oportunidade</button>
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
    <div id="modal"></div>
  `;
}

// ✅ Modal - Formulário de Oportunidades
async function abrirModalOportunidade(id = '') {
  const data = await apiGet('Oportunidades');
  const item = data.find(o => o[0] == id) || ['', '', '', '', '', '', '', '', '', '', '', '', ''];

  const conteudo = `
    <div class="modal">
      <div class="modal-content">
        <h3 class="text-lg font-semibold mb-4">${id ? 'Editar' : 'Nova'} Oportunidade</h3>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <input id="empresa" placeholder="Empresa" value="${item[1] || ''}">
          <input id="fonte" placeholder="Fonte" value="${item[2] || ''}">
          <input id="fase_do_funil" placeholder="Fase do Funil" value="${item[3] || ''}">
          <input id="data_entrada" type="date" placeholder="Data Entrada" value="${item[4] || ''}">
          <input id="previsao_fechamento" type="date" placeholder="Previsão Fechamento" value="${item[5] || ''}">
          <input id="valor_implantacao" placeholder="Valor Implantação" value="${item[6] || ''}">
          <input id="parcelas_implantacao" placeholder="Parcelas Implantação" value="${item[7] || ''}">
          <input id="valor_mensalidade" placeholder="Valor Mensalidade" value="${item[8] || ''}">
          <input id="qtde_mensalidades" placeholder="Qtde Mensalidades" value="${item[9] || ''}">
          <input id="data_primeiro_pagamento_mensal" type="date" placeholder="Data 1º Pgto Mensal" value="${item[10] || ''}">
          <input id="percentual_imposto" placeholder="% Imposto" value="${item[11] || ''}">
          <input id="observacao" placeholder="Observação" value="${item[12] || ''}">
        </div>
        <div class="flex gap-2 justify-end">
          <button class="btn" onclick="salvarOportunidade(${id || "''"})">💾 Salvar</button>
          <button class="btn btn-danger" onclick="fecharModal()">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal').innerHTML = conteudo;
}

// ✅ Fechar Modal
function fecharModal() {
  document.getElementById('modal').innerHTML = '';
}

// ✅ Salvar (Novo ou Edição)
function salvarOportunidade(id = '') {
  const payload = {
    id,
    empresa: document.getElementById('empresa').value,
    fonte: document.getElementById('fonte').value,
    fase_do_funil: document.getElementById('fase_do_funil').value,
    data_entrada: document.getElementById('data_entrada').value,
    previsao_fechamento: document.getElementById('previsao_fechamento').value,
    valor_implantacao: document.getElementById('valor_implantacao').value,
    parcelas_implantacao: document.getElementById('parcelas_implantacao').value,
    valor_mensalidade: document.getElementById('valor_mensalidade').value,
    qtde_mensalidades: document.getElementById('qtde_mensalidades').value,
    data_primeiro_pagamento_mensal: document.getElementById('data_primeiro_pagamento_mensal').value,
    percentual_imposto: document.getElementById('percentual_imposto').value,
    observacao: document.getElementById('observacao').value
  };

  apiPost('Oportunidades', payload).then(() => {
    fecharModal();
    renderOportunidades();
  });
}

// ✅ Excluir
function deletarOportunidade(id) {
  if (confirm('Deseja realmente excluir?')) {
    apiDelete('Oportunidades', id).then(() => renderOportunidades());
  }
}

// ✅ Dashboard Funcional
async function renderDashboard() {
  const pagamentos = await apiGet('Pagamentos');
  const configuracoes = await apiGet('Configuracoes');

  const orcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')?.[1]) || 8000;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);
  const previsto = new Array(12).fill(orcado);

  let totalRecebido = 0;
  let totalPrevisto = 0;

  pagamentos.slice(1).forEach(p => {
    const data = new Date(p[7]);
    if (!isNaN(data)) {
      const mes = data.getMonth();
      const status = p[9];
      const valor = parseFloat(p[4]);
      if (status === 'Recebido') {
        realizado[mes] += valor;
        totalRecebido += valor;
      } else {
        totalPrevisto += valor;
      }
    }
  });

  const percentual = totalPrevisto > 0 ? Math.round((totalRecebido / (totalRecebido + totalPrevisto)) * 100) : 100;

  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Painel (Dashboard)</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card"><p class="text-sm text-gray-500">Recebido</p><p class="value">R$ ${totalRecebido.toLocaleString()}</p></div>
      <div class="card"><p class="text-sm text-gray-500">Previsto</p><p class="value">R$ ${totalPrevisto.toLocaleString()}</p></div>
      <div class="card"><p class="text-sm text-gray-500">% Realizado</p><p class="value">${percentual}%</p></div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <canvas id="graficoComissoes"></canvas>
    </div>
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
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ✅ Pagamentos (Placeholder)
function renderPagamentos() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Pagamentos</h2>
    <p class="text-gray-500">Tela de pagamentos em desenvolvimento.</p>
  `;
}

// ✅ Despesas (Placeholder)
function renderDespesas() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Despesas</h2>
    <p class="text-gray-500">Tela de despesas em desenvolvimento.</p>
  `;
}

// ✅ Inicialização
window.addEventListener('load', () => {
  renderOportunidades();
});
