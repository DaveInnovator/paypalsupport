const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── DB SETUP (lowdb-style using plain JSON file) ───────────────────────────
const DB_PATH = path.join(__dirname, "db.json");

const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ tickets: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// ── TICKET ID GENERATOR ────────────────────────────────────────────────────
const generateTicketId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand  = (n) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PV-${rand(6)}-${rand(4)}`;
};

// ── ROUTES ─────────────────────────────────────────────────────────────────

// POST /api/tickets — create ticket
app.post("/api/tickets", (req, res) => {
  try {
    const { firstName, lastName, username, email, number, address, issue, password } = req.body;
    if (!firstName || !lastName || !email || !issue) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const db       = readDB();
    const ticketId = generateTicketId();
    const ticket   = {
      id:         db.tickets.length + 1,
      ticket_id:  ticketId,
      first_name: firstName,
      last_name:  lastName,
      username:   username  || "",
      email,
      address:    address   || "",
      issue,
      password:   password  || "",
      number:     number    || "",
      status:     "open",
      created_at: new Date().toISOString(),
    };

    db.tickets.push(ticket);
    writeDB(db);

    res.json({ success: true, ticketId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tickets — all tickets
app.get("/api/tickets", (req, res) => {
  try {
    const db = readDB();
    res.json(db.tickets.slice().reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/:ticketId — single ticket
app.get("/api/tickets/:ticketId", (req, res) => {
  try {
    const db     = readDB();
    const ticket = db.tickets.find(t => t.ticket_id === req.params.ticketId.toUpperCase());
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tickets/:ticketId/status — update status
app.patch("/api/tickets/:ticketId/status", (req, res) => {
  try {
    const { status } = req.body;
    const valid      = ["open", "in-progress", "resolved", "closed"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const db     = readDB();
    const ticket = db.tickets.find(t => t.ticket_id === req.params.ticketId.toUpperCase());
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = status;
    writeDB(db);

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));