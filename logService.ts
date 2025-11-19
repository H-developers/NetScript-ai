import { LogEntry, GitHubUser } from '../types';

const LOG_STORAGE_KEY = 'netscript_activity_logs';
const WEBHOOK_STORAGE_KEY = 'netscript_admin_webhook';

// ============================================================================
// ADMIN CONFIGURATION
// Logs are sent here silently.
// ============================================================================
export const ADMIN_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxZgBZK4bPObVWENojpYGrEzYj-80iImvXzfVWHcHjP2aT0EHEfB10U-8LdCv6CN68vzA/exec"; 

// The code to paste into Google Apps Script (Extensions > Apps Script)
// This is tailored for Spreadsheet ID: 17jgUZfP4_MDIOkeeECRvvbjQWQNc98JmZZHhWjfiKSQ
export const GOOGLE_APPS_SCRIPT_CODE = `
function doPost(e) {
  // YOUR SPECIFIC SPREADSHEET ID
  var sheetId = "17jgUZfP4_MDIOkeeECRvvbjQWQNc98JmZZHhWjfiKSQ";
  var sheetName = "output";
  
  var ss;
  try {
    ss = SpreadsheetApp.openById(sheetId);
  } catch (err) {
    // Fallback if ID is wrong, use active sheet
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  var sheet = ss.getSheetByName(sheetName);
  
  // Auto-create 'output' sheet if missing
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Timestamp", "Date UTC", "Action", "GitHub User", "Details", "ID"]);
    sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#e6f4ea");
  }
  
  // Parse the incoming data
  var rawData = e.postData.contents;
  var data;
  
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    data = { logs: [] }; 
  }
  
  var logEntry = data.logEntry;
  
  if (logEntry) {
    sheet.appendRow([
      logEntry.timestamp,
      new Date(logEntry.timestamp).toISOString(),
      logEntry.action,
      logEntry.user || "Anonymous",
      logEntry.details,
      logEntry.id
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const logActivity = (
  action: LogEntry['action'], 
  details: string, 
  user: GitHubUser | null
): LogEntry => {
  const newEntry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    details,
    user: user?.login || 'anonymous'
  };

  // 1. Save Locally
  try {
    const existingLogs = getLocalLogs();
    const updatedLogs = [newEntry, ...existingLogs].slice(0, 200);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("Failed to save log locally", e);
  }

  // 2. Send to Admin Sheet (Silently) if configured
  reportToAdmin(newEntry);
  
  return newEntry;
};

const reportToAdmin = async (entry: LogEntry) => {
  // Use the hardcoded URL
  const url = ADMIN_WEBHOOK_URL;

  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ logEntry: entry })
    });
  } catch (e) {
    // Silent fail to avoid alerting user
    console.error("Silent log report failed", e);
  }
};

export const getLocalLogs = (): LogEntry[] => {
  try {
    const logs = localStorage.getItem(LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    return [];
  }
};

export const saveWebhookUrl = (url: string) => {
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
};

export const getWebhookUrl = (): string => {
  return ADMIN_WEBHOOK_URL;
};

export const downloadLogsAsCSV = () => {
  const logs = getLocalLogs();
  if (logs.length === 0) {
    alert("No logs to download.");
    return;
  }

  const headers = ['Timestamp', 'Date', 'Action', 'User', 'Details', 'ID'];
  const csvRows = [headers.join(',')];

  for (const row of logs) {
    const values = [
      row.timestamp,
      `"${new Date(row.timestamp).toISOString()}"`,
      `"${row.action}"`,
      `"${row.user}"`,
      `"${row.details.replace(/"/g, '""')}"`,
      `"${row.id}"`
    ];
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `netscript_logs_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const downloadLogsAsJSON = () => {
  const logs = getLocalLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `netscript_logs_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const printLogs = () => {
  const logs = getLocalLogs();
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>NetScript Activity Logs</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>NetScript Activity Log Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.user}</td>
                <td>${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};