import { readSheet } from '../../utils/sheets';

export default async function handler(req, res) {
  const sheetName = 'Configuracoes';

  if (req.method === 'GET') {
    try {
      const data = await readSheet(sheetName);

      const categorias = {
        status: new Set(),
        tipo: new Set(),
        fonte: new Set(),
        fase_do_funil: new Set()
      };

      for (let i = 1; i < data.length; i++) {
        categorias.status.add(data[i][0]);
        categorias.tipo.add(data[i][1]);
        categorias.fonte.add(data[i][2]);
        categorias.fase_do_funil.add(data[i][3]);
      }

      const formatar = s => [...s].filter(Boolean);

      res.status(200).json({
        status: formatar(categorias.status),
        tipo: formatar(categorias.tipo),
        fonte: formatar(categorias.fonte),
        fase_do_funil: formatar(categorias.fase_do_funil)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
