const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function readSheet(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: sheetName
  });
  return res.data.values || [];
}

async function appendSheet(sheetName, values) {
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
  return res;
}

async function updateSheet(sheetName, row, values) {
  const range = `${sheetName}!A${row}:Z${row}`;
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
  return res;
}

async function deleteRow(sheetName, row) {
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: await getSheetId(sheetName),
            dimension: 'ROWS',
            startIndex: row - 1,
            endIndex: row
          }
        }
      }]
    }
  });
  return res;
}

async function getSheetId(sheetName) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SPREADSHEET_ID
  });
  const sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  return sheet.properties.sheetId;
}

module.exports = {
  readSheet,
  appendSheet,
  updateSheet,
  deleteRow
};

