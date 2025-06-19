
const API_URL = 'https://script.google.com/macros/s/AKfycbwKWUAjJS0asrpKS5GKyDkk_UZ1kRAqAwQrwY-c2WEJM9LEX8agrNnmeSxv6t_dgomJgi/exec';

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

async function carregarDashboard() {
  const anoSelecionado = parseInt(document.getElementById('anoSelect').value);
  const tipoSelecionado = document.getElementById('tipoSelect').value;

  const pagamentosRes = await axios.get(`${API_URL}?sheet=Pagamentos`);
  const configuracoesRes = await axios.get(`${API_URL}?sheet=Configuracoes`);

  const pagamentos = pagamentosRes.data;
  const configuracoes = configuracoesRes.data;

  const valorOrcado = parseFloat(configuracoes.find(c => c[0] === 'Orcado Mensal')[1]) || 8000;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const realizado = new Array(12).fill(0);
  const orcado = new Array(12).fill(valorOrcado);

  let totalRecebido = 0;
  let totalPrevisto = 0;

  pagamentos.slice(1).forEach(l => {
    const data = new Date(l[8]);
    const status = l[9];
    const valor = parseFloat(l[4]);
    const tipo = l[2];

    if (!isNaN(data) && data.getFullYear() === anoSelecionado) {
      const mes = data.getMonth();
      if (status === 'Recebido') {
        realizado[mes] += valor;
        totalRecebido += valor;
      } else {
        totalPrevisto += valor;
      }
    }
  });

  document.getElementById('cardRecebido').innerText = `R$ ${totalRecebido.toLocaleString()}`;
  document.getElementById('cardPrevisto').innerText = `R$ ${totalPrevisto.toLocaleString()}`;
  const percentual = totalPrevisto > 0 ? Math.round((totalRecebido / (totalRecebido + totalPrevisto)) * 100) : 100;
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
          label: 'Orçado',
          data: orcado,
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
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

document.getElementById('anoSelect').addEventListener('change', carregarDashboard);
document.getElementById('tipoSelect').addEventListener('change', carregarDashboard);

carregarDashboard();
