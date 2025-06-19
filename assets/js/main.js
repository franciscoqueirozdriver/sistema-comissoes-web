// 🔗 Configuração da API Google Sheets
const API_URL = 'https://script.google.com/macros/s/AKfycby0vXMhLgDszzpZC8UwUGcUMwyHliyGnxrkfwdz0hMCO_iveZpJCK969Y9ywFXIiBsuZw/exec';

// 🌙 Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// 🔗 Funções de API
async function apiGet(sheet) {
  const res = await axios.get(`${API_URL}?sheet=${sheet}`);
  return res.data;
}

async function apiPost(sheet, data) {
  await axios.post(`${API_URL}?sheet=${sheet}`, data);
}

async function apiDelete(sheet, id) {
  await axios.post(`${API_URL}?sheet=${sheet}`, { action: 'delete', id: id });
}

// 🚦 Navegação SPA
window.addEventListener('hashchange', loadPage);
document.addEventListener('DOMContentLoaded', loadPage);

function loadPage() {
  const page = location.hash.replace('#', '') || 'painel';
  switch (page) {
    case 'painel':
      renderDashboard();
      break;
    case 'oportunidades':
      renderOportunidades();
      break;
    case 'pagamentos':
      renderPagamentos();
      break;
    case 'despesas':
      renderDespesas();
      break;
    default:
      renderDashboard();
  }
}

// 📊 Painel
async function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Painel (Dashboard)</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card"><p class="text-sm text-gray-500">Recebido</p><p id="cardRecebido" class="value">R$ 0</p></div>
      <div class="card"><p class="text-sm text-gray-500">Previsto</p><p id="cardPrevisto" class="value">R$ 0</p></div>
      <div class="card"><p class="text-sm text-gray-500">% Realizado</p><p id="cardRealizado" class="value">0%</p></div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <canvas id="graficoComissoes"></canvas>
    </div>
  `;

  const pagamentos = await apiGet('Pagamentos');
  const configuracoes = await apiGet('Configuracoes');
  const orcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')[1]) || 8000;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);
  const previsto = new Array(12).fill(0);
  const ano = new Date().getFullYear();

  pagamentos.slice(1).forEach(p => {
    const data = new Date(p[7]);
    const status = p[9];
    const valor = parseFloat(p[4]) || 0;

    if (data.getFullYear() === ano) {
      const mes = data.getMonth();
      if (status === 'Recebido') {
        realizado[mes] += valor;
      } else {
        previsto[mes] += valor;
      }
    }
  });

  const totalRecebido = realizado.reduce((a, b) => a + b, 0);
  const totalPrevisto = previsto.reduce((a, b) => a + b, 0);
  const percentual = totalRecebido + totalPrevisto === 0 ? 100 : Math.round((totalRecebido / (totalRecebido + totalPrevisto)) * 100);

  document.getElementById('cardRecebido').innerText = `R$ ${totalRecebido.toLocaleString()}`;
  document.getElementById('cardPrevisto').innerText = `R$ ${totalPrevisto.toLocaleString()}`;
  document.getElementById('cardRealizado').innerText = `${percentual}%`;

  const ctx = document.getElementById('graficoComissoes').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          type: 'bar',
          label: 'Realizado',
          data: realizado,
          backgroundColor: 'rgba(139, 92, 246, 0.7)'
        },
        {
          type: 'line',
          label: 'Orçado Mensal',
          data: new Array(12).fill(orcado),
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3
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

// 🔥 🔥 🔥
// Aqui você escolher: seguimos agora com
// ✔️ Tela de Oportunidades (com geração de parcelas)

async function renderOportunidades() {
  const oportunidades = await apiGet('Oportunidades');
  const container = document.getElementById('app');

  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Oportunidades</h2>
    <button class="btn mb-4" onclick="formOportunidade()">➕ Nova Oportunidade</button>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>Fase</th>
          <th>Implantação</th>
          <th>Mensalidade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${oportunidades.slice(1).map(o => `
          <tr>
            <td>${o[0]}</td>
            <td>${o[1]}</td>
            <td>${o[3]}</td>
            <td>R$ ${o[6]}</td>
            <td>R$ ${o[8]}</td>
            <td>
              <button class="btn" onclick="formOportunidade(${o[0]})">✏️</button>
              <button class="btn btn-danger" onclick="excluirOportunidade(${o[0]})">🗑️</button>
              ${o[3] !== 'Ganho' ? `<button class="btn" onclick="marcarGanho(${o[0]})">🏆 Ganhar</button>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ➕ Formulário de Oportunidade
async function formOportunidade(id = null) {
  const oportunidades = await apiGet('Oportunidades');
  const item = id ? oportunidades.find(o => o[0] == id) : null;

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${id ? 'Editar' : 'Nova'} Oportunidade</h2>
    <div class="form-group">
      <label>Empresa</label>
      <input id="empresa" value="${item ? item[1] : ''}">
    </div>
    <div class="form-group">
      <label>Fonte</label>
      <input id="fonte" value="${item ? item[2] : ''}">
    </div>
    <div class="form-group">
      <label>Fase</label>
      <select id="fase" class="select">
        <option ${item && item[3] === 'Proposta' ? 'selected' : ''}>Proposta</option>
        <option ${item && item[3] === 'Negociação' ? 'selected' : ''}>Negociação</option>
        <option ${item && item[3] === 'Ganho' ? 'selected' : ''}>Ganho</option>
        <option ${item && item[3] === 'Perdido' ? 'selected' : ''}>Perdido</option>
      </select>
    </div>
    <div class="form-group">
      <label>Valor Implantação</label>
      <input type="number" id="implantacao" value="${item ? item[6] : ''}">
    </div>
    <div class="form-group">
      <label>Parcelas Implantação</label>
      <input type="number" id="parcelasImplantacao" value="${item ? item[7] : 4}">
    </div>
    <div class="form-group">
      <label>Valor Mensalidade</label>
      <input type="number" id="mensalidade" value="${item ? item[8] : ''}">
    </div>
    <div class="form-group">
      <label>Qtd Mensalidades com Comissão</label>
      <input type="number" id="qtdMensalidades" value="${item ? item[9] : 6}">
    </div>
    <div class="form-group">
      <label>Data Início Pagamento Mensalidade</label>
      <input type="date" id="dataMensalidade" value="${item ? item[10] : ''}">
    </div>
    <div class="form-group">
      <button class="btn" onclick="salvarOportunidade(${id || null})">💾 Salvar</button>
      <button class="btn btn-danger" onclick="renderOportunidades()">↩️ Cancelar</button>
    </div>
  `;
}

// 💾 Salvar Oportunidade
async function salvarOportunidade(id = null) {
  const data = {
    empresa: document.getElementById('empresa').value,
    fonte: document.getElementById('fonte').value,
    fase: document.getElementById('fase').value,
    implantacao: parseFloat(document.getElementById('implantacao').value) || 0,
    parcelasImplantacao: parseInt(document.getElementById('parcelasImplantacao').value) || 4,
    mensalidade: parseFloat(document.getElementById('mensalidade').value) || 0,
    qtdMensalidades: parseInt(document.getElementById('qtdMensalidades').value) || 6,
    dataMensalidade: document.getElementById('dataMensalidade').value
  };

  await apiPost('Oportunidades', { id, ...data });
  renderOportunidades();
}

// ❌ Excluir
async function excluirOportunidade(id) {
  if (confirm('Deseja excluir essa oportunidade?')) {
    await apiDelete('Oportunidades', id);
    renderOportunidades();
  }
}

// 🏆 Marcar como Ganho e gerar parcelas
async function marcarGanho(id) {
  const oportunidades = await apiGet('Oportunidades');
  const item = oportunidades.find(o => o[0] == id);
  if (!item) return alert('Oportunidade não encontrada.');

  // Atualiza fase para ganho
  await apiPost('Oportunidades', { id, fase: 'Ganho' });

  const dataInicial = new Date(item[10]);
  const qtdMensalidades = parseInt(item[9]) || 6;
  const parcelasImplantacao = parseInt(item[7]) || 4;
  const valorImplantacao = parseFloat(item[6]) || 0;
  const valorMensalidade = parseFloat(item[8]) || 0;

  // Gera parcelas da Implantação
  for (let i = 0; i < parcelasImplantacao; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);
    await apiPost('Pagamentos', {
      oportunidadeId: id,
      tipo: 'Implantacao',
      valor: valorImplantacao / parcelasImplantacao,
      dataPrevista: data.toISOString().split('T')[0],
      status: 'Previsto'
    });
  }

  // Gera Mensalidades
  for (let i = 0; i < qtdMensalidades; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);
    await apiPost('Pagamentos', {
      oportunidadeId: id,
      tipo: 'Mensalidade',
      valor: valorMensalidade,
      dataPrevista: data.toISOString().split('T')[0],
      status: 'Previsto'
    });
  }

  alert('Parcelas geradas com sucesso!');
  renderOportunidades();
}


// ✔️ Tela de Pagamentos

// 💰 Tela de Pagamentos
async function renderPagamentos() {
  const pagamentos = await apiGet('Pagamentos');

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Pagamentos</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Oportunidade</th>
          <th>Tipo</th>
          <th>Valor</th>
          <th>Data Prevista</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${pagamentos.slice(1).map(p => `
          <tr>
            <td>${p[0]}</td>
            <td>${p[1]}</td>
            <td>${p[2]}</td>
            <td>R$ ${parseFloat(p[4]).toFixed(2)}</td>
            <td>${p[7]}</td>
            <td>${p[9]}</td>
            <td>
              <button class="btn" onclick="formPagamento(${p[0]})">✏️</button>
              <button class="btn btn-danger" onclick="excluirPagamento(${p[0]})">🗑️</button>
              ${p[9] !== 'Recebido' ? `<button class="btn" onclick="marcarRecebido(${p[0]})">✅ Receber</button>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// 📝 Formulário de Pagamento
async function formPagamento(id = null) {
  const pagamentos = await apiGet('Pagamentos');
  const item = id ? pagamentos.find(p => p[0] == id) : null;

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${id ? 'Editar' : 'Novo'} Pagamento</h2>
    <div class="form-group">
      <label>Oportunidade ID</label>
      <input id="oportunidadeId" value="${item ? item[1] : ''}">
    </div>
    <div class="form-group">
      <label>Tipo</label>
      <select id="tipo" class="select">
        <option ${item && item[2] === 'Implantacao' ? 'selected' : ''}>Implantacao</option>
        <option ${item && item[2] === 'Mensalidade' ? 'selected' : ''}>Mensalidade</option>
      </select>
    </div>
    <div class="form-group">
      <label>Valor</label>
      <input type="number" id="valor" value="${item ? item[4] : ''}">
    </div>
    <div class="form-group">
      <label>Data Prevista</label>
      <input type="date" id="dataPrevista" value="${item ? item[7] : ''}">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="status" class="select">
        <option ${item && item[9] === 'Previsto' ? 'selected' : ''}>Previsto</option>
        <option ${item && item[9] === 'Recebido' ? 'selected' : ''}>Recebido</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn" onclick="salvarPagamento(${id || null})">💾 Salvar</button>
      <button class="btn btn-danger" onclick="renderPagamentos()">↩️ Cancelar</button>
    </div>
  `;
}

// 💾 Salvar Pagamento
async function salvarPagamento(id = null) {
  const data = {
    oportunidadeId: document.getElementById('oportunidadeId').value,
    tipo: document.getElementById('tipo').value,
    valor: parseFloat(document.getElementById('valor').value) || 0,
    dataPrevista: document.getElementById('dataPrevista').value,
    status: document.getElementById('status').value
  };

  await apiPost('Pagamentos', { id, ...data });
  renderPagamentos();
}

// ❌ Excluir Pagamento
async function excluirPagamento(id) {
  if (confirm('Deseja excluir esse pagamento?')) {
    await apiDelete('Pagamentos', id);
    renderPagamentos();
  }
}

// ✅ Marcar como Recebido
async function marcarRecebido(id) {
  await apiPost('Pagamentos', { id, status: 'Recebido' });
  renderPagamentos();
}


// ✔️ Tela de Despesas e Receitas

// 💼 Tela de Despesas e Outras Receitas
async function renderDespesas() {
  const despesas = await apiGet('Despesas');
  const outrasReceitas = await apiGet('Outras Receitas');

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Despesas e Outras Receitas</h2>

    <h3 class="text-lg font-semibold mt-6 mb-2">💰 Outras Receitas</h3>
    <button class="btn mb-2" onclick="formReceita()">➕ Nova Receita</button>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Descrição</th>
          <th>Valor</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${outrasReceitas.slice(1).map(r => `
          <tr>
            <td>${r[0]}</td>
            <td>${r[1]}</td>
            <td>R$ ${parseFloat(r[2]).toFixed(2)}</td>
            <td>${r[3]}</td>
            <td>
              <button class="btn" onclick="formReceita(${r[0]})">✏️</button>
              <button class="btn btn-danger" onclick="excluirReceita(${r[0]})">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 class="text-lg font-semibold mt-8 mb-2">💸 Despesas</h3>
    <button class="btn mb-2" onclick="formDespesa()">➕ Nova Despesa</button>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Descrição</th>
          <th>Valor</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${despesas.slice(1).map(d => `
          <tr>
            <td>${d[0]}</td>
            <td>${d[1]}</td>
            <td>R$ ${parseFloat(d[2]).toFixed(2)}</td>
            <td>${d[3]}</td>
            <td>
              <button class="btn" onclick="formDespesa(${d[0]})">✏️</button>
              <button class="btn btn-danger" onclick="excluirDespesa(${d[0]})">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ➕ Formulário de Receita
async function formReceita(id = null) {
  const receitas = await apiGet('Outras Receitas');
  const item = id ? receitas.find(r => r[0] == id) : null;

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${id ? 'Editar' : 'Nova'} Receita</h2>
    <div class="form-group">
      <label>Descrição</label>
      <input id="descricaoReceita" value="${item ? item[1] : ''}">
    </div>
    <div class="form-group">
      <label>Valor</label>
      <input type="number" id="valorReceita" value="${item ? item[2] : ''}">
    </div>
    <div class="form-group">
      <label>Data</label>
      <input type="date" id="dataReceita" value="${item ? item[3] : ''}">
    </div>
    <div class="form-group">
      <button class="btn" onclick="salvarReceita(${id || null})">💾 Salvar</button>
      <button class="btn btn-danger" onclick="renderDespesas()">↩️ Cancelar</button>
    </div>
  `;
}

// 💾 Salvar Receita
async function salvarReceita(id = null) {
  const data = {
    descricao: document.getElementById('descricaoReceita').value,
    valor: parseFloat(document.getElementById('valorReceita').value) || 0,
    data: document.getElementById('dataReceita').value
  };

  await apiPost('Outras Receitas', { id, ...data });
  renderDespesas();
}

// ❌ Excluir Receita
async function excluirReceita(id) {
  if (confirm('Deseja excluir essa receita?')) {
    await apiDelete('Outras Receitas', id);
    renderDespesas();
  }
}

// ➕ Formulário de Despesa
async function formDespesa(id = null) {
  const despesas = await apiGet('Despesas');
  const item = id ? despesas.find(d => d[0] == id) : null;

  const container = document.getElementById('app');
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${id ? 'Editar' : 'Nova'} Despesa</h2>
    <div class="form-group">
      <label>Descrição</label>
      <input id="descricaoDespesa" value="${item ? item[1] : ''}">
    </div>
    <div class="form-group">
      <label>Valor</label>
      <input type="number" id="valorDespesa" value="${item ? item[2] : ''}">
    </div>
    <div class="form-group">
      <label>Data</label>
      <input type="date" id="dataDespesa" value="${item ? item[3] : ''}">
    </div>
    <div class="form-group">
      <button class="btn" onclick="salvarDespesa(${id || null})">💾 Salvar</button>
      <button class="btn btn-danger" onclick="renderDespesas()">↩️ Cancelar</button>
    </div>
  `;
}

// 💾 Salvar Despesa
async function salvarDespesa(id = null) {
  const data = {
    descricao: document.getElementById('descricaoDespesa').value,
    valor: parseFloat(document.getElementById('valorDespesa').value) || 0,
    data: document.getElementById('dataDespesa').value
  };

  await apiPost('Despesas', { id, ...data });
  renderDespesas();
}

// ❌ Excluir Despesa
async function excluirDespesa(id) {
  if (confirm('Deseja excluir essa despesa?')) {
    await apiDelete('Despesas', id);
    renderDespesas();
  }
}

