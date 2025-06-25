import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

export async function readSheet(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName
  });
  return res.data.values;
}

export async function appendSheet(sheetName, row) {
  return await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'RAW',
    requestBody: { values: [row] }
  });
}

export async function updateSheet(sheetName, rowIndex, row) {
  const range = `${sheetName}!A${rowIndex}`;
  return await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [row] }
  });
}

export async function deleteRow(sheetName, rowIndex) {
  return await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: null,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }
      ]
    }
  });
}
