const CONFIG = PropertiesService.getScriptProperties();

function doGet() {
  return json({ ok: true, service: "Digitics submissions" });
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || "{}");
    if (!body.secret || body.secret !== CONFIG.getProperty("WEBHOOK_SECRET")) {
      return json({ ok: false, error: "Unauthorized" });
    }
    if (
      !Array.isArray(body.columns) ||
      !Array.isArray(body.values) ||
      body.columns.length !== body.values.length
    ) {
      return json({ ok: false, error: "Invalid row" });
    }

    const spreadsheet = SpreadsheetApp.openById(
      CONFIG.getProperty("SPREADSHEET_ID"),
    );
    const sheet =
      spreadsheet.getSheetByName(
        CONFIG.getProperty("SHEET_NAME") || "Applications",
      ) || spreadsheet.insertSheet("Applications");
    const applicationId = String(body.values[0] || "");
    if (!applicationId)
      return json({ ok: false, error: "Missing application ID" });

    if (sheet.getLastRow() === 0)
      sheet.getRange(1, 1, 1, body.columns.length).setValues([body.columns]);
    const ids =
      sheet.getLastRow() > 1
        ? sheet
            .getRange(2, 1, sheet.getLastRow() - 1, 1)
            .getValues()
            .flat()
            .map(String)
        : [];
    if (ids.includes(applicationId)) return json({ ok: true, duplicate: true });

    sheet.appendRow(body.values);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
