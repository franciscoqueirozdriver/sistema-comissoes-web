// pages/index.js
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Head>
        <title>Sistema de Comissões</title>
      </Head>

      <header className="bg-violet-600 text-white p-4 shadow">
        <h1 className="text-2xl font-semibold">Sistema de Comissões</h1>
      </header>

      <main className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/oportunidades">
          <div className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-medium">Oportunidades</h2>
            <p className="text-sm">Gerencie oportunidades e vendas</p>
          </div>
        </Link>

        <Link href="/pagamentos">
          <div className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-medium">Pagamentos</h2>
            <p className="text-sm">Visualize e controle os pagamentos</p>
          </div>
        </Link>

        <Link href="/despesas">
          <div className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-medium">Despesas</h2>
            <p className="text-sm">Registre e acompanhe despesas</p>
          </div>
        </Link>

        <Link href="/outras-receitas">
          <div className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-medium">Outras Receitas</h2>
            <p className="text-sm">Lançamentos avulsos de receita</p>
          </div>
        </Link>
      </main>
    </div>
  );
}
