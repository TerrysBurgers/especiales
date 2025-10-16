/**
 * Apps Script — API de registro de votos en Google Sheets
 * Pasos:
 * 1) En tu Google Drive, creá una Hoja llamada "TERRYS_VOTES" (o la que quieras).
 * 2) Colocá encabezados en la fila 1: Timestamp, Email, Burger, VoteId, UserAgent, IP
 * 3) Extensions -> Apps Script: pegá este código y guardá.
 * 4) Deploy -> New deployment -> Type: Web app -> "Execute as: Me", "Who has access: Anyone"
 * 5) Copiá la URL y pegala en CONFIG.SHEET_WEBAPP_URL en script.js
 */

const SHEET_NAME = "TERRYS_VOTES";
const HEADERS = ["Timestamp","Email","Burger","VoteId","UserAgent","IP"];

function _getSheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) sh = ss.insertSheet(SHEET_NAME);
  const headerRow = sh.getRange(1,1,1,HEADERS.length).getValues()[0];
  if (JSON.stringify(headerRow) !== JSON.stringify(HEADERS)){
    sh.clear();
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  }
  return sh;
}

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents);
    const email = (body.email || "").toString().trim().toLowerCase();
    const burger = (body.burger || "").toString().trim();
    const voteId = (body.voteId || "").toString().trim();
    const ua = (body.ua || "").toString();
    const ip = e?.parameter?.ip || e?.headers?.["x-forwarded-for"] || "";

    if (!email || !burger || !voteId){
      return _json({ status:"error", error:"missing_fields" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      return _json({ status:"error", error:"invalid_email" });
    }

    const sh = _getSheet();
    const rng = sh.getRange(2,2, sh.getLastRow()-1 || 0, 1); // columna B (Email)
    const emails = rng.getValues().flat().map(v => (v||"").toString().trim().toLowerCase());
    if (emails.includes(email)){
      return _json({ status:"error", error:"duplicate" });
    }

    const now = new Date();
    sh.appendRow([now, email, burger, voteId, ua, ip]);
    return _json({ status:"ok" });
  }catch(err){
    return _json({ status:"error", error: err && err.message ? err.message : "unknown" });
  }
}

function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
