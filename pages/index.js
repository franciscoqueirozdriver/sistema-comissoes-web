// pages/index.js

import Link from 'next/link';
import '../styles/globals.css';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-10">
        Sistema de Comissões
      </h1>

      <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/oportunidades">
          <a className="block p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-purple-700">Oportunidades</h2>
            <p className="text-sm text-gray-600">Gerencie oportunidades e vendas</p>
          </a>
        </Link>

        <Link href="/pagamentos">
          <a className="block p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-purple-700">Pagamentos</h2>
            <p className="text-sm text-gray-600">Visualize e controle os pagamentos</p>
          </a>
        </Link>

        <Link href="/despesas">
          <a className="block p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-purple-700">Despesas</h2>
            <p className="text-sm text-gray-600">Registre e acompanhe despesas</p>
          </a>
        </Link>

        <Link href="/outras-receitas">
          <a className="block p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-purple-700">Outras Receitas</h2>
            <p className="text-sm text-gray-600">Lançamentos avulsos de receita</p>
          </a>
        </Link>
      </div>
    </div>
  );
}
