import { google } from 'googleapis';
import { auth } from '../../utils/auth';

export default async function handler(req, res) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Configuracoes';

  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      res.status(200).json(response.data.values);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

