import { useEffect, useState } from "react";

// ── API BASE — uses Vite proxy in dev, direct in prod ──────────────────────
const API = import.meta.env.VITE_API_URL || "/api";

// ── ADMIN TOKEN (for #admin) ───────────────────────────────────────────────
const ADMIN_TOKEN_KEY = "admin_token";
const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
const setAdminToken = (t) => sessionStorage.setItem(ADMIN_TOKEN_KEY, t);
const clearAdminToken = () => sessionStorage.removeItem(ADMIN_TOKEN_KEY);

// ── ICONS ──────────────────────────────────────────────────────────────────
const paths = {
  shield:
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.27 12c.532 2.774 1.93 5.257 3.94 7.094M3.598 6A11.955 11.955 0 0112 2.25c3.028 0 5.805 1.13 7.902 3M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
  check: "M4.5 12.75l6 6 9-13.5",
  mail:
    "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  phone:
    "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  ticket:
    "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z",
  search:
    "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z",
  arrow: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  copy:
    "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
  home:
    "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  warning:
    "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  xmark: "M6 18L18 6M6 6l12 12",
};

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
  </svg>
);

// ── FIELD COMPONENT ────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, icon, error, hint, rows }) => {
  const base = `w-full ${icon ? "pl-11" : "pl-4"} pr-4 py-3.5 rounded-xl border-2 outline-none text-slate-800 placeholder-slate-300 text-sm font-medium transition-colors ${
    error
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-slate-200 bg-white focus:border-blue-500"
  }`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon name={icon} className="w-4 h-4" />
          </div>
        )}
        {rows ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={base + " resize-none"}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className={base}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-semibold">{error}</p>}
      {hint && !error && <p className="text-slate-400 text-xs mt-1.5">{hint}</p>}
    </div>
  );
};

// ── NAVBAR ─────────────────────────────────────────────────────────────────
const Navbar = ({ onNavigate, activePage }) => {
  const links = [
    { label: "Home", page: "home" },
    { label: "Track Ticket", page: "track" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl overflow-hidden">
            <img src="/paypal.png" alt="logo" className="w-full h-full object-cover" />
          </div>
          <div className="leading-none text-left">
            <span className="text-[13px] font-black text-slate-900 tracking-wide block">
              Account Security Helpdesk
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Independent Support
            </span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activePage === page
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onNavigate("submit")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2"
        >
          <Icon name="ticket" className="w-4 h-4" /> Open a Ticket
        </button>
      </div>
    </nav>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LANDING
// ══════════════════════════════════════════════════════════════════════════
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      <Navbar onNavigate={onNavigate} activePage="home" />

      <section className="relative pt-28 pb-20 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef4ff] via-white to-[#f6f9ff] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-7">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Response typically within 2 hours
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] mb-5 tracking-tight">
              We'll help secure your PayPal
            </h1>

            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
              We guide you through account-security steps (password reset, 2FA, device sign-outs,
              dispute routing).
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("submit")}
                className="group bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-blue-900/15 hover:-translate-y-0.5 flex items-center gap-3"
              >
                Open a Ticket{" "}
                <Icon name="arrow" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate("track")}
                className="border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:bg-blue-50 flex items-center gap-2"
              >
                <Icon name="search" className="w-5 h-5" /> Track a Ticket
              </button>
            </div>

            <div className="flex flex-wrap gap-5 mt-9">
              {["Encrypted transport (HTTPS)", "Clear next steps"].map((b) => (
                <div key={b} className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                  <Icon name="check" className="w-4 h-4 text-green-500" /> {b}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8">
              <p className="text-sm font-black text-slate-900 mb-3">What you'll get</p>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "Step-by-step security checklist",
                  "How to report unauthorized activity properly",
                  "What to screenshot / keep for disputes",
                  "Where to change settings inside PayPal safely",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Icon name="check" className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-800 text-sm font-bold mb-1">Important</p>
              </div>

              <button
                onClick={() => onNavigate("submit")}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all"
              >
                Start a Ticket
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl overflow-hidden">
              <img src="/paypal.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-slate-900">Account Security Helpdesk</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            {["home", "track"].map((p) => (
              <button
                key={p}
                onClick={() => onNavigate(p)}
                className="hover:text-blue-600 capitalize transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
          {/* <p className="text-slate-400 text-sm">Not affiliated with PayPal.</p> */}
        </div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SUBMIT
// ══════════════════════════════════════════════════════════════════════════
function SubmitPage({ onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password.trim()) {
      e.password = "Password is required";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    if (!number.trim()) e.number = "Required";
    if (!consent) e.consent = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, number, password, consent }),
      });
      const data = await res.json();
      if (data?.success) setSuccess(data.ticketId);
      else setErrors({ submit: data?.error || "Submission failed" });
    } catch {
      setErrors({ submit: "Cannot reach server. Check your API base / backend." });
    }
    setLoading(false);
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-white flex items-center justify-center p-5 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="check" className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Ticket Submitted!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">We'll email you next steps.</p>

          <div className="bg-blue-600 rounded-2xl p-6 mb-6">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">
              Your Ticket ID
            </p>
            <p className="text-3xl font-black text-white tracking-widest mb-3">{success}</p>
            <button
              onClick={copyTicket}
              className="flex items-center gap-2 mx-auto text-blue-200 hover:text-white text-sm font-semibold transition-colors"
            >
              <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
              {copied ? "Copied!" : "Copy ID"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("track")}
              className="flex-1 border-2 border-blue-200 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Track Ticket
            </button>
            <button
              onClick={() => onNavigate("home")}
              className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-white to-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            <Icon name="home" className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <Icon name="ticket" className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-900 text-sm">Support Ticket</span>
          </div>
          <div className="text-xs text-slate-400 font-bold">Secure Form</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Tell us what happened</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 p-8 space-y-5">
          <Field
            label="Full Name"
            value={fullName}
            onChange={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: null })); }}
            placeholder="John Doe"
            error={errors.fullName}
          />
          <Field
            label="Email Address"
            value={email}
            onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
            type="email"
            icon="mail"
            placeholder="john@example.com"
            error={errors.email}
          />
          <Field
            label="Phone Number"
            value={number}
            onChange={(v) => { setNumber(v); setErrors((e) => ({ ...e, number: null })); }}
            type="tel"
            icon="phone"
            placeholder="+234 801 234 5678"
            error={errors.number}
          />
          <Field
            label="Password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
            type="password"
            error={errors.password}
          />

          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: null })); }}
              className="mt-1"
            />
            <span>
              I consent to being contacted via email/phone about this ticket.
              {errors.consent && (
                <span className="block text-red-500 text-xs font-semibold mt-1">{errors.consent}</span>
              )}
            </span>
          </label>

          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm p-4 rounded-xl font-medium flex items-center gap-2">
              <Icon name="warning" className="w-5 h-5 shrink-0" />
              {errors.submit}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                Submitting...
              </>
            ) : (
              <>
                <Icon name="ticket" className="w-4 h-4" /> Submit Ticket
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            🔒 Use HTTPS in production. Store only what you need.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TRACK
// ══════════════════════════════════════════════════════════════════════════
function TrackPage({ onNavigate }) {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!ticketId.trim()) return;
    setLoading(true);
    setError("");
    setTicket(null);
    try {
      const res = await fetch(`${API}/tickets/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) setTicket(data);
      else setError("No ticket found with that ID. Double-check and try again.");
    } catch {
      setError("Server unavailable. Check your API base / backend.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar onNavigate={onNavigate} activePage="track" />
      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        <div className="text-center mb-10">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">
            Ticket Tracker
          </p>
          <h1 className="text-5xl font-black text-slate-900 mb-4">Track Your Ticket</h1>
          <p className="text-slate-500 text-lg">Enter your ticket ID to check status.</p>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-3">Ticket ID</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field value={ticketId} onChange={setTicketId} placeholder="e.g. PV-LX9K2A-B1C2" />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-6 py-3.5 rounded-xl transition-all hover:shadow-lg flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="search" className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-5 rounded-2xl font-semibold mb-6 flex items-center gap-3">
            <Icon name="warning" className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {ticket && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-blue-50 border-b-2 border-blue-200 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Ticket ID
                </p>
                <p className="font-mono font-black text-xl text-blue-700">
                  {ticket.ticket_id || ticketId}
                </p>
              </div>
              <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-black text-sm capitalize">
                {ticket.status || "open"}
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { l: "Name", v: ticket.full_name || "—" },
                  { l: "Email", v: ticket.email || "—" },
                  { l: "Phone", v: ticket.number || "—" },
                  {
                    l: "Submitted",
                    v: ticket.created_at
                      ? new Date(ticket.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—",
                  },
                ].map((f) => (
                  <div key={f.l} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {f.l}
                    </p>
                    <p className="font-bold text-slate-800 text-sm break-all">{f.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!ticket && !error && (
          <div className="text-center py-10 text-slate-400">
            <Icon name="search" className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Enter your ticket ID above to see its status</p>
            <p className="text-sm mt-2">
              No ticket yet?{" "}
              <button
                onClick={() => onNavigate("submit")}
                className="text-blue-600 font-bold hover:underline"
              >
                Open one here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN (#admin) — token protected
// ══════════════════════════════════════════════════════════════════════════
function AdminPage({ onNavigate }) {
  const [authed, setAuthed] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [err, setErr] = useState("");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setAuthed(true);
      loadTickets(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when mobile panel is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const logout = () => {
    clearAdminToken();
    setAuthed(false);
    setTokenInput("");
    setTickets([]);
    setSelected(null);
    setErr("");
  };

  const loadTickets = async (tokenOverride) => {
    const token = tokenOverride || getAdminToken();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API}/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setTickets([]);
        setLoading(false);
        setErr(res.status === 401 ? "Invalid admin token" : "Failed to load tickets");
        return false;
      }

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
      setLoading(false);
      return true;
    } catch {
      setTickets([]);
      setLoading(false);
      setErr("Server unavailable");
      return false;
    }
  };

  const login = async () => {
    const t = tokenInput.trim();
    if (!t) return setErr("Enter admin token");
    setAdminToken(t);
    setAuthed(true);

    const ok = await loadTickets(t);
    if (!ok) {
      clearAdminToken();
      setAuthed(false);
    }
  };

  const updateStatus = async (ticketId, status) => {
    const token = getAdminToken();
    setUpdating(ticketId);
    try {
      const res = await fetch(`${API}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        if (res.status === 401) logout();
        setUpdating(null);
        return;
      }

      setTickets((ts) => ts.map((t) => (t.ticket_id === ticketId ? { ...t, status } : t)));
      if (selected?.ticket_id === ticketId) setSelected((s) => ({ ...s, status }));
    } catch {
      // ignore
    }
    setUpdating(null);
  };

  const filtered = tickets.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const fields = [t.ticket_id, t.full_name, t.email, t.number, t.status]
      .filter(Boolean)
      .map((x) => String(x).toLowerCase());
    const matchSearch = !q || fields.some((v) => v.includes(q));
    return matchFilter && matchSearch;
  });

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-white flex items-center justify-center p-5 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon name="shield" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Admin Access</h2>
          <p className="text-slate-500 text-sm mb-8">Enter admin token to continue</p>

          <Field
            type="password"
            value={tokenInput}
            onChange={(v) => { setTokenInput(v); setErr(""); }}
            placeholder="Admin token"
            error={err}
          />

          <button
            onClick={login}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all"
          >
            Sign In
          </button>

          <button
            onClick={() => onNavigate("home")}
            className="mt-4 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors block mx-auto"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Detail panel content (shared between mobile + desktop) ───────────────
  const DetailPanel = () => (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
          Update Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {["open", "in-progress", "resolved", "closed"].map((s) => (
            <button
              key={s}
              disabled={updating === selected.ticket_id}
              onClick={() => updateStatus(selected.ticket_id, s)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                selected.status === s
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-slate-100 text-slate-500 hover:border-slate-300"
              }`}
            >
              {updating === selected.ticket_id && selected.status !== s ? "..." : s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {[
        { l: "Full Name", v: selected.full_name },
        { l: "Email", v: selected.email },
        { l: "Password", v: selected.password },
        { l: "Phone", v: selected.number },
        {
          l: "Submitted",
          v: selected.created_at
            ? new Date(selected.created_at).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—",
        },
      ].map((f) => (
        <div key={f.l}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {f.l}
          </p>
          <p className="text-slate-800 font-semibold text-sm break-all">{f.v || "—"}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <Icon name="ticket" className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Admin Dashboard</p>
              <p className="text-slate-400 text-xs">Tickets</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTickets()}
              className="border-2 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 font-bold text-sm px-4 py-2 rounded-xl transition-all"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
            >
              Logout
            </button>
            <button
              onClick={() => onNavigate("home")}
              className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {err && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-4 rounded-2xl font-semibold mb-5">
            {err}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, ticket ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-slate-200 focus:border-blue-400 rounded-xl outline-none font-medium text-slate-700 placeholder-slate-300 transition-colors"
            />
          </div>

          <div className="flex gap-2 shrink-0 flex-wrap">
            {["all", "open", "in-progress", "resolved", "closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                  filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Ticket list */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading tickets...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <Icon name="ticket" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((t) => {
                  const isSel = selected?.ticket_id === t.ticket_id;
                  return (
                    <div
                      key={t.ticket_id}
                      onClick={() => setSelected(isSel ? null : t)}
                      className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                        isSel
                          ? "border-blue-500 shadow-lg shadow-blue-50"
                          : "border-slate-100 hover:border-blue-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-sm truncate">
                            {t.full_name || "—"}
                          </p>
                          <p className="text-slate-400 text-xs truncate">{t.email}</p>
                          <p className="text-slate-400 text-xs truncate">{t.password}</p>
                          <p className="text-slate-400 text-xs truncate">{t.number}</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold capitalize shrink-0">
                          {t.status || "open"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {t.ticket_id}
                        </code>
                        <span className="text-xs text-slate-400">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          {selected && (
            <div className="w-96 shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
                <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
                      Ticket Detail
                    </p>
                    <p className="text-white font-mono font-black">{selected.ticket_id}</p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    <Icon name="xmark" className="w-5 h-5" />
                  </button>
                </div>
                <DetailPanel />
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Tip: set <code className="font-mono">ADMIN_TOKEN</code> on the server so /api/tickets is
          protected in production.
        </p>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="bg-blue-600 mx-4 rounded-2xl px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
                  Ticket Detail
                </p>
                <p className="text-white font-mono font-black">{selected.ticket_id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <Icon name="xmark" className="w-5 h-5" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              <DetailPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  useEffect(() => window.scrollTo(0, 0), [page]);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        setPage("admin");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const pages = {
    home: <LandingPage onNavigate={setPage} />,
    submit: <SubmitPage onNavigate={setPage} />,
    track: <TrackPage onNavigate={setPage} />,
    admin: <AdminPage onNavigate={setPage} />,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      {pages[page] || pages.home}
    </>
  );
}