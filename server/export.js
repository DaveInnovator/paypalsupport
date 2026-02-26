const Database = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'support.db'));

db.all(`SELECT id, ticket_id, first_name, last_name, username,password,number, email, address, issue, status, created_at FROM tickets ORDER BY created_at DESC`, [], (err, rows) => {
  if (err) { console.error('Error:', err); process.exit(1); }
  if (!rows.length) { console.log('No tickets found.'); process.exit(0); }

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const headers = ['ID','Ticket ID','First Name','Last Name','Username','password','number','Email','Address','Issue','Status','Created At'];
  const lines = [headers.join(',')];

  for (const r of rows) {
    lines.push([
      r.id, r.ticket_id, r.first_name, r.last_name,
      r.username,r.password,r.number, r.email, r.address, r.issue, r.status, r.created_at
    ].map(escape).join(','));
  }

  const filename = `tickets_export_${new Date().toISOString().slice(0,10)}.csv`;
  const out = path.join(__dirname, filename);
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log(`✅ Exported ${rows.length} ticket(s) to ${filename}`);
  db.close();
});
