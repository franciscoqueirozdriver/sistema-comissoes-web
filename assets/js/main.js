const API_URL = 'https://script.google.com/macros/s/AKfycbyyK01zS9CGJdb0ONaHcUAXp3Cp4Tz4BB5Hp85FdJxjx3zK4qZm7WGG4YzH3ugT5IE/exec';

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

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

function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card"><p class="text-sm text-gray-500">Recebido</p><p id="cardRecebido" class="value">R$ 0</p></div>
      <div class="card"><p class="text-sm text-gray-500">Previsto</p><p id="cardPrevisto" class="value">R$ 0</p></div>
      <div class="card"><p class="text-sm text-gray-500">% Realizado</p><p id="cardRealizado" class="value">0%</p></div>
    </div>
    <canvas id="graficoComissoes"></canvas>
  `;
  carregarDashboard();
}

async function carregarDashboard() {
  const pagamentos = await apiGet('Pagamentos');
  const configuracoes = await apiGet('Configuracoes');

  const orcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')?.[1]) || 8000;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);

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

  const totalRecebido = realizado.reduce((a, b) => a + b, 0);
  const totalPrevisto = orcado * 12;
  const percentual = totalPrevisto > 0 ? Math.round((totalRecebido / totalPrevisto) * 100) : 0;

  document.getElementById('cardRecebido').innerText = `R$ ${totalRecebido.toLocaleString()}`;
  document.getElementById('cardPrevisto').innerText = `R$ ${totalPrevisto.toLocaleString()}`;
  document.getElementById('cardRealizado').innerText = `${percentual}%`;

  const ctx = document.getElementById('graficoComissoes').getContext('2d');
  if (window.grafico) {
    window.grafico.destroy();
  }
  window.grafico = new Chart(ctx, {
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
          data: new Array(12).fill(orcado),
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

window.addEventListener('load', () => {
  renderDashboard();
});
