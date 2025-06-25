// pages/index.js

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Sistema de Comissões</h1>

      <h2>
        <Link href="/oportunidades">Oportunidades</Link>
      </h2>
      <p>Gerencie oportunidades e vendas</p>

      <h2>
        <Link href="/pagamentos">Pagamentos</Link>
      </h2>
      <p>Visualize e controle os pagamentos</p>

      <h2>
        <Link href="/despesas">Despesas</Link>
      </h2>
      <p>Registre e acompanhe despesas</p>

      <h2>
        <Link href="/outras-receitas">Outras Receitas</Link>
      </h2>
      <p>Lançamentos avulsos de receita</p>
    </div>
  );
}
