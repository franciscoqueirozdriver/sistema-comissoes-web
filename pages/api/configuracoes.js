import { readSheet } from '../../utils/sheets';

export default async function handler(req, res) {
  try {
    const data = await readSheet('Configuracoes');
    const [headers, ...rows] = data;
    const response = {};
    headers.forEach((header, index) => {
      response[header.toLowerCase()] = rows.map(r => r[index]).filter(Boolean);
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
