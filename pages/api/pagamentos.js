import { readSheet, appendSheet, updateSheet, deleteRow } from '../../utils/sheets';

export default async function handler(req, res) {
  const sheetName = 'Pagamentos';

  if (req.method === 'GET') {
    try {
      const data = await readSheet(sheetName);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, action, ...campos } = req.body;
      const data = await readSheet(sheetName);

      const headers = data[0];
      const rows = data.slice(1);

      if (action === 'delete') {
        const index = rows.findIndex(r => String(r[0]) === String(id));
        if (index >= 0) {
          await deleteRow(sheetName, index + 2);
          return res.status(200).json({ result: 'deleted' });
        } else {
          return res.status(404).json({ error: 'Registro não encontrado' });
        }
      }

      const values = headers.map(h => campos[h] || '');

      if (!id) {
        const nextId = (rows.length ? parseInt(rows[rows.length - 1][0]) || 0 : 0) + 1;
        await appendSheet(sheetName, [nextId, ...values.slice(1)]);
        return res.status(200).json({ result: 'success', id: nextId });
      } else {
        const index = rows.findIndex(r => String(r[0]) === String(id));
        if (index >= 0) {
          await updateSheet(sheetName, index + 2, [id, ...values.slice(1)]);
          return res.status(200).json({ result: 'updated' });
        } else {
          return res.status(404).json({ error: 'Registro não encontrado' });
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
  }
}
