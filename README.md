# PayVault Support Platform

A full-stack support ticket platform for PayVault payment services. Built with React, TailwindCSS, Node.js, and SQLite.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
npm install
npm start
```

The server runs on **http://localhost:3001**

### 2. Frontend Setup (new terminal)

```bash
cd client
npm install
npm run dev
```

The app runs on **http://localhost:3000**

---

## 📁 Project Structure

```
payvault-support/
├── client/               # React + Vite + TailwindCSS frontend
│   ├── src/
│   │   ├── App.jsx       # All pages (Landing, Submit, Track)
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Tailwind imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── server/               # Node.js + Express + SQLite backend
    ├── server.js         # All routes and DB logic
    ├── support.db        # Auto-created SQLite database
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Submit a new support ticket |
| `GET` | `/api/tickets` | List all tickets (admin) |
| `GET` | `/api/tickets/:ticketId` | Get ticket by ID |
| `PATCH` | `/api/tickets/:ticketId/status` | Update ticket status |

### POST /api/tickets — Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "address": "123 Main St, Lagos",
  "issue": "My payment of $500 was deducted but not received by merchant...",
  "password": "securepass"
}
```

### Response

```json
{
  "success": true,
  "ticketId": "PV-LX9K2A-B1C2",
  "message": "Support ticket submitted successfully"
}
```

---

## 🎨 Pages

- **Landing Page** — Hero, features, how-it-works, stats
- **Submit Ticket** — 2-step form with validation
- **Track Ticket** — Look up any ticket by ID

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS 3, Vite |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Auth | bcryptjs password hashing |
| Font | Sora (Google Fonts) |

---

## Ticket Statuses

- `open` — New ticket, awaiting review
- `in-progress` — Being worked on
- `resolved` — Issue fixed
- `closed` — Ticket closed
