import { google } from 'googleapis';

export const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,     // ← Vem do Environment da Vercel
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Corrige as quebras de linha da chave
  ['https://www.googleapis.com/auth/spreadsheets']       // Permissão para acessar o Google Sheets
);
