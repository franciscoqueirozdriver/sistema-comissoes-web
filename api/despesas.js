import { google } from 'googleapis';
import { auth } from '../../utils/auth';

export default async function handler(req, res) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Despesas';

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

  else if (req.method === 'POST') {
    const body = req.body;

    try {
      if (body.action === 'delete') {
        const getRows = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = getRows.data.values;
        const index = rows.findIndex(r => r[0] === String(body.id));

        if (index > 0) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId: 0,
                    dimension: 'ROWS',
                    startIndex: index,
                    endIndex: index + 1,
                  },
                },
              }],
            },
          });
          res.status(200).json({ result: 'success', action: 'deleted' });
        } else {
          res.status(404).json({ error: 'ID not found' });
        }

      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              [
                body.id || '',
                body.descricao || '',
                body.categoria || '',
                body.valor || '',
                body.data || '',
                body.observacao || '',
              ],
            ],
          },
        });
        res.status(200).json({ result: 'success', action: 'added' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

