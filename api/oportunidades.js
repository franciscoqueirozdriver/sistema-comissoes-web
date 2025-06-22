import { google } from 'googleapis';
import { auth } from '../../utils/auth';

export default async function handler(req, res) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Oportunidades';

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
        // Exclusão pelo ID (assumindo que o ID está na coluna A)
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
        // Adicionar nova oportunidade
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              [
                body.id || '',
                body.empresa || '',
                body.fonte || '',
                body.fase_do_funil || '',
                body.data_entrada || '',
                body.previsao_fechamento || '',
                body.valor_implantacao || '',
                body.parcelas_implantacao || '',
                body.valor_mensalidade || '',
                body.qtde_mensalidades || '',
                body.data_primeiro_pagamento_mensal || '',
                body.percentual_imposto || '',
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
