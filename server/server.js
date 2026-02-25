const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'support.db'), (err) => {
  if (err) { console.error('DB open error:', err); process.exit(1); }
  console.log('Connected to SQLite database.');
});

const run = (sql, params = []) =>
  new Promise((res, rej) => db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

const get = (sql, params = []) =>
  new Promise((res, rej) => db.get(sql, params, (err, row) => { err ? rej(err) : res(row); }));

const all = (sql, params = []) =>
  new Promise((res, rej) => db.all(sql, params, (err, rows) => { err ? rej(err) : res(rows); }));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    issue TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    ticket_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

function generateTicketId() {
  return 'PV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

app.post('/api/tickets', async (req, res) => {
  try {
    const { firstName, lastName, username, email, address, issue, password } = req.body;
    if (!firstName || !lastName || !username || !email || !address || !issue || !password)
      return res.status(400).json({ error: 'All fields are required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const ticketId = generateTicketId();
    await run(
      `INSERT INTO tickets (first_name,last_name,username,email,address,issue,password_hash,ticket_id) VALUES (?,?,?,?,?,?,?,?)`,
      [firstName, lastName, username, email, address, issue, passwordHash, ticketId]
    );
    res.json({ success: true, ticketId, message: 'Support ticket submitted successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await all(`SELECT id,first_name,last_name,username,email,address,issue,status,ticket_id,created_at FROM tickets ORDER BY created_at DESC`);
    res.json(tickets);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await get(
      `SELECT id,first_name,last_name,username,email,address,issue,status,ticket_id,created_at FROM tickets WHERE ticket_id=?`,
      [req.params.ticketId]
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/tickets/:ticketId/status', async (req, res) => {
  try {
    await run('UPDATE tickets SET status=? WHERE ticket_id=?', [req.body.status, req.params.ticketId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('PayVault Support Server running on http://localhost:' + PORT));
