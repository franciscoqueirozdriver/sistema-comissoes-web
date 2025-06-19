const API_URL = 'https://script.google.com/macros/s/SEU_CODIGO/exec';

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

  pagamentos.slice(1).forEach(l => {
    const data = new Date(l[7]);
    const status = l[9];
    const valor = parseFloat(l[4]);
    const tipo = l[2];

    if (!isNaN(data) && data.getFullYear() === anoSelecionado) {
      if (tipoSelecionado === 'Todos' || tipo === tipoSelecionado) {
        const mes = data.getMonth();
        if (status === 'Recebido') {
          realizado[mes] += valor;
        }
      }
    }
  });

  const ctx = document.getElementById('graficoComissoes').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { type: 'bar', label: 'Realizado', data: realizado, backgroundColor: 'rgba(59, 130, 246, 0.7)' },
        { type: 'line', label: 'Orçado', data: orcado, borderColor: 'rgba(34, 197, 94, 1)', borderWidth: 2, fill: false, tension: 0.3 }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

document.getElementById('anoSelect').addEventListener('change', carregarDashboard);
document.getElementById('tipoSelect').addEventListener('change', carregarDashboard);
carregarDashboard();
