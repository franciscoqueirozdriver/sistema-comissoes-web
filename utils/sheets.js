import { google } from 'googleapis';
import { auth } from './auth';

const sheets = google.sheets({ version: 'v4', auth });

export async function readSheet(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: sheetName,
  });
  return res.data.values || [];
}

export async function appendSheet(sheetName, values) {
  return await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] },
  });
}

export async function updateSheet(sheetName, row, values) {
  const range = `${sheetName}!A${row}:Z${row}`;
  return await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] },
  });
}

export async function deleteRow(sheetName, row) {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find(s => s.properties.title === sheetName);

  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const sheetId = sheet.properties.sheetId;

  return await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: row - 1,
            endIndex: row,
          },
        },
      }],
    },
  });
}
