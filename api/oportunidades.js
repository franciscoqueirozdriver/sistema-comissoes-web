import { google } from 'googleapis';
import { auth } from '../../utils/auth';

export default async function handler(req, res) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Oportunidades';

  if (req.method === 'GET') {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    res.status(200).json(response.data.values);
  }

  else if (req.method === 'POST') {
    const body = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            body.empresa,
            body.fonte,
            body.fase_do_funil,
            body.data_entrada,
            body.previsao_fechamento,
            body.valor_implantacao,
            body.parcelas_implantacao,
            body.valor_mensalidade,
            body.qtde_mensalidades,
            body.data_primeiro_pagamento_mensal,
            body.percentual_imposto,
            body.observacao,
          ],
        ],
      },
    });
    res.status(200).json({ result: 'success', action: 'added' });
  }

  else {
    res.status(405).send('Method Not Allowed');
  }
}

