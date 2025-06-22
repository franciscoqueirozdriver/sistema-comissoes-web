import { sheets } from '../../utils/auth';

export default async function handler(req, res) {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Configuracoes';

  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      res.status(200).json(response.data.values);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
