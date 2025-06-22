const { readSheet, appendSheet, updateSheet, deleteRow } = require('../utils/sheets');

export default async function handler(req, res) {
  const sheetName = 'Oportunidades';

  if (req.method === 'GET') {
    const data = await readSheet(sheetName);
    res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { id, action, ...campos } = req.body;
    const data = await readSheet(sheetName);

    const headers = data[0];
    const rows = data.slice(1);

    if (action === 'delete') {
      const index = rows.findIndex(r => r[0] === id);
      if (index >= 0) {
        await deleteRow(sheetName, index + 2);
        res.status(200).json({ result: 'deleted' });
      } else {
        res.status(404).json({ error: 'Registro não encontrado' });
      }
      return;
    }

    const values = headers.map(h => campos[h] || '');

    if (!id) {
      const nextId = (rows.length ? parseInt(rows[rows.length - 1][0]) : 0) + 1;
      await appendSheet(sheetName, [nextId, ...values.slice(1)]);
      res.status(200).json({ result: 'success', id: nextId });
    } else {
      const index = rows.findIndex(r => r[0] === id);
      if (index >= 0) {
        await updateSheet(sheetName, index + 2, [id, ...values.slice(1)]);
        res.status(200).json({ result: 'updated' });
      } else {
        res.status(404).json({ error: 'Registro não encontrado' });
      }
    }
  }
}
