import { useState, useEffect, useCallback, useRef } from "react";

// ── API BASE — uses Vite proxy in dev, direct in prod ──────────────────────
const API = import.meta.env.VITE_API_URL || "/api";

// ── ICONS ──────────────────────────────────────────────────────────────────
const paths = {
  shield:  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.27 12c.532 2.774 1.93 5.257 3.94 7.094M3.598 6A11.955 11.955 0 0112 2.25c3.028 0 5.805 1.13 7.902 3M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
  ticket:  "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z",
  check:   "M4.5 12.75l6 6 9-13.5",
  user:    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  mail:    "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  lock:    "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  search:  "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z",
  arrow:   "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  home:    "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  eye:     "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  eyeoff:  "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88",
  chart:   "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.5C12.75 3.004 13.254 3 13.875 3h2.25C16.746 3 17.25 3.504 17.25 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125zM9 10.875C9 10.254 9.504 9.75 10.125 9.75h2.25c.621 0 1.125.504 1.125 1.125v9c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 019 19.875v-9z",
  money:   "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  ban:     "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  help:    "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  clock:   "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  chevron: "M19.5 8.25l-7.5 7.5-7.5-7.5",
  copy:    "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
  map:     "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  star:    "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  admin:   "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  download:"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  refresh: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  xmark:   "M6 18L18 6M6 6l12 12",
  phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
};

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
  </svg>
);

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const ISSUE_CATEGORIES = [
  { id:"account_limited", icon:"ban",     label:"Account Limited / Frozen",   desc:"Account restricted or frozen by PayPal" },
  { id:"payment_failed",  icon:"warning", label:"Payment Failed / Declined",   desc:"Transaction declined or not processing" },
  { id:"refund_dispute",  icon:"money",   label:"Refund / Dispute",            desc:"Chargeback, refund not received, dispute" },
  { id:"unauthorized",    icon:"shield",  label:"Unauthorized Transaction",    desc:"Charges you don't recognize" },
  { id:"withdrawal",      icon:"chart",   label:"Withdrawal Issue",            desc:"Can't withdraw funds to bank or card" },
  { id:"account_access",  icon:"lock",    label:"Can't Access Account",        desc:"Locked out, 2FA or password issues" },
  { id:"verification",    icon:"user",    label:"Verification / Identity",     desc:"ID verification pending or rejected" },
  { id:"other",           icon:"help",    label:"Other Issue",                 desc:"Something else not listed above" },
];

const STATUS_CFG = {
  open:          { label:"Open",        bg:"bg-blue-50",  border:"border-blue-200",  text:"text-blue-700",  dot:"bg-blue-500",  badgeBg:"bg-blue-100"  },
  "in-progress": { label:"In Progress", bg:"bg-amber-50", border:"border-amber-200", text:"text-amber-700", dot:"bg-amber-500", badgeBg:"bg-amber-100" },
  resolved:      { label:"Resolved",    bg:"bg-green-50", border:"border-green-200", text:"text-green-700", dot:"bg-green-500", badgeBg:"bg-green-100" },
  closed:        { label:"Closed",      bg:"bg-slate-50", border:"border-slate-200", text:"text-slate-600", dot:"bg-slate-400", badgeBg:"bg-slate-100" },
};

const FAQ_DATA = [
  { q:"How long does it take to resolve a PayPal account limitation?",  a:"Most account limitations are resolved within 3–5 business days once all required documents are submitted. Complex cases involving disputes may take up to 30 days per PayPal's review policy." },
  { q:"What documents do I need to lift a PayPal account freeze?",      a:"Typically: a government-issued photo ID, proof of address (utility bill or bank statement), and business documentation if you have a business account. Our team will guide you through exactly what's needed." },
  { q:"Can I still receive payments while my account is limited?",      a:"In most limitation cases, funds can still be received but withdrawals are blocked. Our specialists can advise on your specific situation and help expedite the review." },
  { q:"How do I dispute an unauthorized PayPal charge?",                a:"You can open a dispute within 180 days of the transaction. Our team will help you gather the right evidence and submit a strong dispute claim to maximize your chances of a successful resolution." },
  { q:"My PayPal withdrawal has been pending for days — what do I do?", a:"Pending withdrawals can be caused by bank verification issues, account flags, or PayPal holds. Submit a ticket and we'll diagnose the exact reason and work with you on a resolution." },
];

// ── HELPERS ────────────────────────────────────────────────────────────────
const getCategory = (issue) => issue?.match(/^\[(.+?)\]/)?.[1] ?? null;
const cleanIssue  = (issue) => issue?.replace(/^\[.+?\]\s*/, "") ?? issue;

const PPLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#003087"/>
    <text x="50" y="72" textAnchor="middle" fill="white" fontSize="62" fontWeight="900" fontFamily="Arial">P</text>
  </svg>
);

// ── NAVBAR — Admin link removed ────────────────────────────────────────────
const Navbar = ({ onNavigate, activePage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { label:"Home", page:"home" }, { label:"Issues", page:"issues" },
    { label:"FAQ",  page:"faq"  }, { label:"Track Ticket", page:"track" },
  ];
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
          <PPLogo size={34} />
          <div className="leading-none">
            <span className="text-[13px] font-black text-[#003087] tracking-wide block">PayPal</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Support Center</span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ label, page }) => (
            <button key={page} onClick={() => onNavigate(page)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activePage === page ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>

        <button onClick={() => onNavigate("submit")}
          className="hidden md:flex bg-[#003087] hover:bg-[#002070] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 items-center gap-2">
          <Icon name="ticket" className="w-4 h-4" /> Open a Ticket
        </button>

        <button onClick={() => setOpen(v => !v)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
          <Icon name={open ? "xmark" : "ticket"} className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-5 py-4 space-y-1">
          {[...links, { label:"Open a Ticket", page:"submit" }].map(({ label, page }) => (
            <button key={page} onClick={() => { onNavigate(page); setOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// ── FIELD COMPONENT — fixes click-per-letter focus bug ─────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, icon, error, hint, rows }) => {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const inputType = isPass ? (show ? "text" : "password") : type;
  const base = `w-full ${icon ? "pl-11" : "pl-4"} ${isPass ? "pr-12" : "pr-4"} py-3.5 rounded-xl border-2 outline-none text-slate-800 placeholder-slate-300 text-sm font-medium transition-colors ${error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-white focus:border-blue-500"}`;
  return (
    <div>
      {label && <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icon name={icon} className="w-4 h-4" /></div>}
        {rows
          ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={base + " resize-none"} />
          : <input type={inputType} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" className={base} />
        }
        {isPass && (
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShow(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <Icon name={show ? "eyeoff" : "eye"} className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-semibold">{error}</p>}
      {hint && !error && <p className="text-slate-400 text-xs mt-1.5">{hint}</p>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      <Navbar onNavigate={onNavigate} activePage="home" />

      <section className="relative pt-28 pb-24 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef4ff] via-white to-[#f0f7ff] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:"radial-gradient(circle,#003087 1px,transparent 0)",backgroundSize:"28px 28px"}} />

        <div className="max-w-6xl mx-auto relative grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-7">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Support — Avg. Response &lt; 2 Hours
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#003087] leading-[1.05] mb-6 tracking-tight">
              PayPal Issues?<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[#009cde]">Get Them Fixed.</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-lg">
              Specialized PayPal support — frozen accounts, failed payments, unauthorized charges and refund disputes. Real humans, real results.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate("submit")}
                className="group bg-[#003087] hover:bg-[#002070] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-blue-900/25 hover:-translate-y-1 flex items-center gap-3">
                Open a Support Ticket <Icon name="arrow" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate("track")}
                className="border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:bg-blue-50 flex items-center gap-2">
                <Icon name="search" className="w-5 h-5" /> Track a Ticket
              </button>
            </div>
            <div className="flex flex-wrap gap-5 mt-10">
              {["SSL Encrypted","Verified Experts","PayPal Specialists"].map(b => (
                <div key={b} className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                  <Icon name="check" className="w-4 h-4 text-green-500" /> {b}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="check" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700">TICKET RESOLVED</p>
                  <p className="text-sm text-green-600 font-medium">Account limitation lifted in 4 hours</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Common Issues We Solve</p>
              <div className="space-y-3">
                {ISSUE_CATEGORIES.slice(0, 5).map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon name={cat.icon} className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                      <p className="text-xs text-slate-400">{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate("issues")} className="w-full mt-5 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">View all issues →</button>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#009cde] text-white text-xs font-black px-4 py-2 rounded-full shadow-lg shadow-blue-400/40">50K+ Resolved</div>
          </div>
        </div>
      </section>

      <section className="bg-[#003087] py-10 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{n:"< 2hrs",l:"Avg. First Response"},{n:"98.4%",l:"Resolution Rate"},{n:"50K+",l:"Tickets Resolved"},{n:"24/7",l:"Support Available"}].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{s.n}</div>
              <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">What We Handle</p>
            <h2 className="text-4xl font-black text-[#003087]">Every PayPal Issue, Covered</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ISSUE_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => onNavigate("submit")}
                className="group text-left p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                  <Icon name={cat.icon} className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-[15px] leading-snug">{cat.label}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{cat.desc}</p>
                <div className="mt-4 text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Get help <Icon name="arrow" className="w-3 h-3" /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black text-[#003087]">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {icon:"ticket",t:"Submit Ticket",  d:"Describe your PayPal issue"},
              {icon:"mail",  t:"Get Ticket ID",  d:"Receive your case reference"},
              {icon:"search",t:"We Investigate", d:"Specialists analyze your case"},
              {icon:"check", t:"Issue Resolved", d:"We confirm & close the case"},
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white border-2 border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Icon name={s.icon} className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{s.t}</h3>
                <p className="text-slate-500 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => onNavigate("submit")} className="bg-[#003087] hover:bg-[#002070] text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5">
              Start Now — It's Free
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-[#003087] text-center mb-14">What Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {name:"Marcus O.", loc:"Lagos, NG",   text:"My PayPal account was limited for 3 weeks. These guys got it unlocked in 48 hours. Absolutely incredible."},
              {name:"Sarah K.",  loc:"London, UK",  text:"Unauthorized charges had me panicking. The team filed the dispute and got my $340 back. So grateful."},
              {name:"James T.",  loc:"Toronto, CA", text:"Withdrawal stuck for 10 days. Support diagnosed the issue immediately — bank verification glitch — fixed same day."},
            ].map(t => (
              <div key={t.name} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_,i) => <Icon key={i} name="star" className="w-4 h-4 text-amber-400" />)}</div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-700 text-sm">{t.name[0]}</div>
                  <div><p className="font-bold text-slate-900 text-sm">{t.name}</p><p className="text-slate-400 text-xs">{t.loc}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#003087] to-[#002060] rounded-3xl p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 2px 2px,white 1px,transparent 0)",backgroundSize:"32px 32px"}} />
          <h2 className="text-4xl font-black text-white mb-4 relative">Having a PayPal problem?</h2>
          <p className="text-blue-200 text-lg mb-10 relative">Submit a ticket — our team responds within 2 hours.</p>
          <button onClick={() => onNavigate("submit")} className="bg-white text-[#003087] font-black px-12 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-colors shadow-xl relative">
            Open a Support Ticket
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5"><PPLogo size={30} /><span className="font-black text-[#003087]">PayPal Support Center</span></div>
          <div className="flex gap-6 text-sm text-slate-500">
            {["home","issues","faq","track"].map(p => (
              <button key={p} onClick={() => onNavigate(p)} className="hover:text-blue-600 capitalize transition-colors font-medium">{p}</button>
            ))}
          </div>
          <p className="text-slate-400 text-sm">Not affiliated with PayPal Inc.</p>
        </div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ISSUES PAGE
// ══════════════════════════════════════════════════════════════════════════
const TIPS = {
  account_limited: ["Gather a photo ID and proof of address","Check your email for PayPal's request letter","Do NOT open a new account — it may get permanently banned","Submit all docs in one go to avoid delays"],
  payment_failed:  ["Check if your card/bank details are up to date","Verify your billing address matches your card","Try a different funding source","Check if PayPal has flagged your account"],
  refund_dispute:  ["You have 180 days from transaction to open a dispute","Document all communications with the seller","Screenshot the original listing / invoice","Escalate to a claim if seller is unresponsive after 3 days"],
  unauthorized:    ["Change your PayPal password immediately","Enable 2FA on your account","Report to PayPal within 60 days","Check linked devices and revoke unknown sessions"],
  withdrawal:      ["Confirm bank account is verified","Check for any account flags or limitations","Try a manual bank transfer instead of instant","Small test transfer first to confirm connection"],
  account_access:  ["Use PayPal's account recovery with your email","Prepare your last login email and phone number","If hacked, contact PayPal directly","Our team can guide you through the recovery process"],
  verification:    ["Upload clear, high-resolution documents","Ensure your name matches exactly across all docs","Business accounts need additional registration docs","Processing usually takes 1–3 business days"],
  other:           ["Describe your issue as clearly as possible","Include transaction IDs, dates, and amounts","Screenshot any error messages","Our team will route to the right specialist"],
};

function IssuesPage({ onNavigate }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar onNavigate={onNavigate} activePage="issues" />
      <div className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Issue Types</p>
          <h1 className="text-5xl font-black text-[#003087] mb-4">PayPal Issue Guide</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Select your issue type to see expert tips, then open a ticket.</p>
        </div>
        <div className="space-y-4">
          {ISSUE_CATEGORIES.map((cat, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={cat.id} className={`border-2 rounded-2xl transition-all duration-300 ${isOpen ? "border-blue-300 shadow-lg shadow-blue-50" : "border-slate-100 hover:border-blue-200"}`}>
                <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center gap-4 p-6 text-left">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-blue-600" : "bg-blue-50"}`}>
                    <Icon name={cat.icon} className={`w-6 h-6 ${isOpen ? "text-white" : "text-blue-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-lg">{cat.label}</h3>
                    <p className="text-slate-500 text-sm">{cat.desc}</p>
                  </div>
                  <Icon name="chevron" className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <p className="text-blue-800 font-bold text-xs mb-4 uppercase tracking-widest">Expert Tips</p>
                      <ul className="space-y-3">
                        {TIPS[cat.id].map((t, ti) => (
                          <li key={ti} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-white text-[10px] font-black">{ti + 1}</span>
                            </div>{t}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => onNavigate("submit")} className="mt-6 bg-[#003087] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#002070] transition-colors flex items-center gap-2">
                        <Icon name="ticket" className="w-4 h-4" /> Open a Ticket for This Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// FAQ PAGE
// ══════════════════════════════════════════════════════════════════════════
function FAQPage({ onNavigate }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar onNavigate={onNavigate} activePage="faq" />
      <div className="max-w-3xl mx-auto px-5 pt-28 pb-20">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">FAQ</p>
          <h1 className="text-5xl font-black text-[#003087] mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg">Quick answers to the most common PayPal support questions.</p>
        </div>
        <div className="space-y-3 mb-12">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className={`border-2 rounded-2xl transition-all ${openIdx === i ? "border-blue-300 shadow-md" : "border-slate-100 hover:border-blue-200"}`}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-6 text-left">
                <p className="font-bold text-slate-900 leading-snug">{item.q}</p>
                <Icon name="chevron" className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && <div className="px-6 pb-6"><p className="text-slate-600 leading-relaxed text-sm">{item.a}</p></div>}
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-[#003087] to-[#002060] rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-black text-white mb-3">Still have questions?</h3>
          <p className="text-blue-200 mb-7 text-sm">Our specialists will answer your specific PayPal issue personally.</p>
          <button onClick={() => onNavigate("submit")} className="bg-white text-[#003087] font-black px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">Open a Support Ticket</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SUBMIT PAGE
// ══════════════════════════════════════════════════════════════════════════
function SubmitPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [username,  setUsername]  = useState("");
  const [email,     setEmail]     = useState("");
  const [number, setNumber] = useState("")
  const [address,   setAddress]   = useState("");
  const [issue,     setIssue]     = useState("");
  const [password,  setPassword]  = useState("");

  const [category,  setCategory]  = useState("");
  const [priority,  setPriority]  = useState("normal");
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [copied,    setCopied]    = useState(false);

  const clearErr = (f) => setErrors(e => ({ ...e, [f]: null }));

  const validateStep1 = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim())  e.lastName  = "Required";
    if (!username.trim())  e.username  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e = {};
    if (!category)           e.category = "Please select an issue type";
    if (!address.trim())     e.address  = "Required";
    if (issue.trim().length < 30) e.issue = "Please describe in at least 30 characters";
    if (password.length < 8) e.password = "Minimum 8 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    const catLabel = ISSUE_CATEGORIES.find(c => c.id === category)?.label || category;
    try {
      const res = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ firstName, lastName, username, email, number, address, password, issue: `[${catLabel}] ${issue}` }),
      });
      const data = await res.json();
      if (data.success) setSuccess(data.ticketId);
      else setErrors({ submit: data.error || "Submission failed" });
    } catch {
      setErrors({ submit: "Cannot reach server. Is the backend running on port 3001?" });
    }
    setLoading(false);
  };

  const copyTicket = () => { navigator.clipboard.writeText(success); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-white flex items-center justify-center p-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="check" className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-[#003087] mb-3">Ticket Submitted!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">Your PayPal support ticket has been received. Our specialists will respond within 2 hours via email.</p>
        <div className="bg-[#003087] rounded-2xl p-6 mb-6">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Your Ticket ID</p>
          <p className="text-3xl font-black text-white tracking-widest mb-3">{success}</p>
          <button onClick={copyTicket} className="flex items-center gap-2 mx-auto text-blue-200 hover:text-white text-sm font-semibold transition-colors">
            <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />{copied ? "Copied!" : "Copy ID"}
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
          <p className="text-amber-800 text-sm font-bold mb-1">⚠ Save your Ticket ID</p>
          <p className="text-amber-700 text-xs leading-relaxed">You'll need this to track your case. We'll also email it to {email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate("track")} className="flex-1 border-2 border-blue-200 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">Track Ticket</button>
          <button onClick={() => onNavigate("home")}  className="flex-1 bg-[#003087] text-white font-bold py-3 rounded-xl hover:bg-[#002070] transition-colors text-sm">Back to Home</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-white to-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-slate-600 hover:text-blue-700 text-sm font-semibold transition-colors">
            <Icon name="home" className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2"><PPLogo size={28} /><span className="font-black text-[#003087] text-sm">Support Ticket</span></div>
          <div className="text-xs text-slate-400 font-bold">Step {step} of 2</div>
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-[#009cde] transition-all duration-500" style={{width: step === 1 ? "50%" : "100%"}} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#003087] mb-2">{step === 1 ? "Your Details" : "Your PayPal Issue"}</h1>
          <p className="text-slate-500">{step === 1 ? "Tell us who you are so we can reach you." : "Describe your PayPal problem as clearly as possible."}</p>
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="First Name" value={firstName} onChange={v => { setFirstName(v); clearErr("firstName"); }} icon="user" placeholder="John" error={errors.firstName} />
              <Field label="Last Name"  value={lastName}  onChange={v => { setLastName(v);  clearErr("lastName");  }} placeholder="Doe" error={errors.lastName} />
            </div>
            <Field label="Username / PayPal Display Name" value={username} onChange={v => { setUsername(v); clearErr("username"); }} placeholder="@johndoe" hint="The name shown on your PayPal account" error={errors.username} />
            <Field label="Email Address" value={email} onChange={v => { setEmail(v); clearErr("email"); }} type="email" icon="mail" placeholder="john@example.com" hint="Must match your PayPal account email" error={errors.email} />
<Field label="Phone Number" value={number} onChange={v => { setNumber(v); clearErr("number"); }} type="tel" icon="phone" placeholder="+1 234 567 8900" hint="Include country code" error={errors.number} />
  <button onClick={() => { if (validateStep1()) setStep(2); }}
              className="w-full bg-[#003087] hover:bg-[#002070] text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-900/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
              Continue <Icon name="arrow" className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 p-8 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Issue Type <span className="text-red-400">*</span></label>
              <div className="grid sm:grid-cols-2 gap-3">
                {ISSUE_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); clearErr("category"); }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${category === cat.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${category === cat.id ? "bg-blue-600" : "bg-slate-100"}`}>
                      <Icon name={cat.icon} className={`w-4 h-4 ${category === cat.id ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <span className={`text-xs font-bold leading-snug ${category === cat.id ? "text-blue-700" : "text-slate-700"}`}>{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.category}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Priority Level</label>
              <div className="flex gap-3">
                {[{v:"low",l:"Low",sub:"Non-urgent"},{v:"normal",l:"Normal",sub:"Within 24hrs"},{v:"high",l:"High",sub:"ASAP"}].map(p => (
                  <button key={p.v} type="button" onClick={() => setPriority(p.v)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all ${priority === p.v ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <p className={`text-sm font-black ${priority === p.v ? "text-blue-700" : "text-slate-700"}`}>{p.l}</p>
                    <p className="text-xs text-slate-400">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Billing / Home Address" value={address} onChange={v => { setAddress(v); clearErr("address"); }} icon="map" placeholder="123 Main Street, City, Country" error={errors.address} />

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Describe Your Issue <span className="text-red-400">*</span></label>
              <Field
                value={issue}
                onChange={v => { setIssue(v); clearErr("issue"); }}
                rows={6}
                placeholder={
                  category === "account_limited" ? "e.g. My PayPal account was limited on [date]. I need to provide documents. I sell [items] on [platform]..." :
                  category === "unauthorized"    ? "e.g. On [date], I noticed a charge of $[amount] to [merchant] that I didn't authorize..." :
                  category === "payment_failed"  ? "e.g. I'm trying to send $[amount] to [email]. It shows error [X]. My funding source is [bank/card]..." :
                  "Describe your PayPal issue in detail. Include dates, amounts, transaction IDs, and any error messages..."
                }
                error={errors.issue}
              />
              <div className="flex justify-end mt-1.5">
                <p className={`text-xs font-semibold ${issue.length >= 30 ? "text-green-600" : "text-slate-400"}`}>{issue.length}/30</p>
              </div>
            </div>

            <Field label="Create Account Password" value={password} onChange={v => { setPassword(v); clearErr("password"); }} type="password" icon="lock" placeholder="Minimum 8 characters" hint="Secures your support account" error={errors.password} />

            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm p-4 rounded-xl font-medium flex items-center gap-2">
                <Icon name="warning" className="w-5 h-5 shrink-0" />{errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="border-2 border-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors">← Back</button>
              <button onClick={submit} disabled={loading}
                className="flex-1 bg-[#003087] hover:bg-[#002070] disabled:bg-blue-300 text-white font-bold py-4 rounded-2xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2">
                {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><Icon name="ticket" className="w-4 h-4" /> Submit Support Ticket</>}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">🔒 Your data is encrypted and never shared with third parties</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TRACK PAGE
// ══════════════════════════════════════════════════════════════════════════
function TrackPage({ onNavigate }) {
  const [ticketId, setTicketId] = useState("");
  const [ticket,   setTicket]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const search = async () => {
    if (!ticketId.trim()) return;
    setLoading(true); setError(""); setTicket(null);
    try {
      const res  = await fetch(`${API}/tickets/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) setTicket(data);
      else setError("No ticket found with that ID. Double-check and try again.");
    } catch { setError("Server unavailable — ensure the backend is running on port 3001."); }
    setLoading(false);
  };

  const cfg = ticket ? (STATUS_CFG[ticket.status] || STATUS_CFG.open) : null;

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar onNavigate={onNavigate} activePage="track" />
      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Ticket Tracker</p>
          <h1 className="text-5xl font-black text-[#003087] mb-4">Track Your Ticket</h1>
          <p className="text-slate-500 text-lg">Enter your ticket ID to check your PayPal support case.</p>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-3">Ticket ID</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field value={ticketId} onChange={setTicketId} placeholder="e.g. PV-LX9K2A-B1C2" />
            </div>
            <button onClick={search} disabled={loading}
              className="bg-[#003087] hover:bg-[#002070] disabled:bg-blue-300 text-white font-bold px-6 py-3.5 rounded-xl transition-all hover:shadow-lg flex items-center gap-2 shrink-0">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="search" className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-5 rounded-2xl font-semibold mb-6 flex items-center gap-3">
            <Icon name="warning" className="w-5 h-5 shrink-0" />{error}
          </div>
        )}

        {ticket && cfg && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className={`${cfg.bg} ${cfg.border} border-b-2 px-8 py-6 flex items-center justify-between`}>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                <p className={`font-mono font-black text-xl ${cfg.text}`}>{ticket.ticket_id}</p>
              </div>
              <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full ${cfg.badgeBg} border ${cfg.border} ${cfg.text}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${ticket.status === "open" ? "animate-pulse" : ""}`} />
                <span className="font-black text-sm">{cfg.label}</span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {getCategory(ticket.issue) && (
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-2 rounded-full">
                  <Icon name="ticket" className="w-3.5 h-3.5" />{getCategory(ticket.issue)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-5">
                {[
                  {l:"Full Name",  v:`${ticket.first_name} ${ticket.last_name}`},
                  {l:"Username",   v:`@${ticket.username}`},
                  {l:"Email",      v:ticket.email},
                  {l:"Submitted",  v:new Date(ticket.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})},
                ].map(f => (
                  <div key={f.l} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.l}</p>
                    <p className="font-bold text-slate-800 text-sm truncate">{f.v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-2xl p-5">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Issue Description</p>
                <p className="text-slate-700 text-sm leading-relaxed">{cleanIssue(ticket.issue)}</p>
              </div>
              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <Icon name="clock" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm font-medium">Our team is reviewing your case. Expected response within 2 hours. Check your email for updates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!ticket && !error && (
          <div className="text-center py-10 text-slate-400">
            <Icon name="ticket" className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Enter your ticket ID above to see its status</p>
            <p className="text-sm mt-2">No ticket yet? <button onClick={() => onNavigate("submit")} className="text-blue-600 font-bold hover:underline">Open one here</button></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN PAGE  (hidden from navbar — access via /admin route directly)
// ══════════════════════════════════════════════════════════════════════════
const ADMIN_PASS = "admin123";

function AdminPage({ onNavigate }) {
  const [authed,    setAuthed]    = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passErr,   setPassErr]   = useState("");
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState(null);
  const [updating,  setUpdating]  = useState(null);
  const [exportMsg, setExportMsg] = useState("");

  const login = () => {
    if (passInput === ADMIN_PASS) { setAuthed(true); loadTickets(); }
    else setPassErr("Incorrect password");
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch { setTickets([]); }
    setLoading(false);
  };

  const updateStatus = async (ticketId, status) => {
    setUpdating(ticketId);
    try {
      await fetch(`${API}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTickets(ts => ts.map(t => t.ticket_id === ticketId ? { ...t, status } : t));
      if (selected?.ticket_id === ticketId) setSelected(s => ({ ...s, status }));
    } catch {}
    setUpdating(null);
  };

  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["ID","Ticket ID","First Name","Last Name","Username","Email","Address","password","Issue","Status","Created At"];
    const rows = tickets.map(t => [t.id,t.ticket_id,t.first_name,t.last_name,t.username,t.email,t.address,t.issue,t.status,t.created_at].map(esc).join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const url  = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    const a    = document.createElement("a");
    a.href = url; a.download = `tickets_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    setExportMsg(`✅ Exported ${tickets.length} tickets`);
    setTimeout(() => setExportMsg(""), 3000);
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [t.ticket_id,t.first_name,t.last_name,t.email,t.username].some(v => v?.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved:   tickets.filter(t => t.status === "resolved").length,
  };

  if (!authed) return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-white flex items-center justify-center p-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-10 text-center">
        <div className="w-16 h-16 bg-[#003087] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="lock" className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-[#003087] mb-2">Admin Access</h2>
        <p className="text-slate-500 text-sm mb-8">Enter the admin password to continue</p>
        <Field type="password" value={passInput} onChange={setPassInput} placeholder="Password" error={passErr} />
        <button onClick={login} className="w-full mt-5 bg-[#003087] hover:bg-[#002070] text-white font-bold py-3.5 rounded-2xl transition-all">
          Sign In
        </button>
        <button onClick={() => onNavigate("home")} className="mt-4 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors block mx-auto">
          ← Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PPLogo size={32} />
            <div>
              <p className="font-black text-[#003087] text-sm">Admin Dashboard</p>
              <p className="text-slate-400 text-xs">PayPal Support Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {exportMsg && <span className="text-green-600 text-xs font-bold">{exportMsg}</span>}
            <button onClick={exportCSV} className="flex items-center gap-2 border-2 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 font-bold text-sm px-4 py-2 rounded-xl transition-all">
              <Icon name="download" className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={loadTickets} className="flex items-center gap-2 border-2 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 font-bold text-sm px-4 py-2 rounded-xl transition-all">
              <Icon name="refresh" className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
              <Icon name="home" className="w-4 h-4" /> Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label:"Total Tickets", value:stats.total,      cls:"bg-[#003087] text-white"},
            {label:"Open",          value:stats.open,       cls:"bg-blue-50 text-blue-700 border border-blue-200"},
            {label:"In Progress",   value:stats.inProgress, cls:"bg-amber-50 text-amber-700 border border-amber-200"},
            {label:"Resolved",      value:stats.resolved,   cls:"bg-green-50 text-green-700 border border-green-200"},
          ].map(s => (
            <div key={s.label} className={`${s.cls} rounded-2xl p-6`}>
              <p className="text-3xl font-black mb-1">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ticket ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-slate-200 focus:border-blue-400 rounded-xl outline-none font-medium text-slate-700 placeholder-slate-300 transition-colors" />
          </div>
          <div className="flex gap-2 shrink-0">
            {["all","open","in-progress","resolved","closed"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${filter === f ? "bg-[#003087] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
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
                {filtered.map(t => {
                  const cfg = STATUS_CFG[t.status] || STATUS_CFG.open;
                  const isSel = selected?.ticket_id === t.ticket_id;
                  return (
                    <div key={t.ticket_id} onClick={() => setSelected(isSel ? null : t)}
                      className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${isSel ? "border-blue-500 shadow-lg shadow-blue-50" : "border-slate-100 hover:border-blue-200 hover:shadow-md"}`}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 font-black text-blue-700 text-sm">{t.first_name[0]}</div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{t.first_name} {t.last_name}</p>
                            <p className="text-slate-400 text-xs truncate">{t.email}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.badgeBg} ${cfg.text} shrink-0`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="text-xs font-bold">{cfg.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{t.ticket_id}</code>
                        <span className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>
                      </div>
                      {getCategory(t.issue) && (
                        <div className="mt-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg inline-block">{getCategory(t.issue)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selected && (
            <div className="w-96 shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
                <div className="bg-[#003087] px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Ticket Detail</p>
                    <p className="text-white font-mono font-black">{selected.ticket_id}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-blue-300 hover:text-white transition-colors">
                    <Icon name="xmark" className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(STATUS_CFG).map(([k, v]) => (
                        <button key={k} disabled={updating === selected.ticket_id} onClick={() => updateStatus(selected.ticket_id, k)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1.5 ${selected.status === k ? `${v.badgeBg} ${v.border} ${v.text}` : "border-slate-100 text-slate-500 hover:border-slate-300"}`}>
                          <div className={`w-2 h-2 rounded-full ${v.dot}`} />{v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-slate-100" />
                  {[
    {l:"Full Name", v:`${selected.first_name} ${selected.last_name}`},
    {l:"Username",  v:`@${selected.username}`},
    {l:"Email",     v:selected.email},
    {l:"Password",  v:selected.password},
{l:"Phone",     v:selected.number},
    {l:"Address",   v:selected.address},
    {l:"Submitted", v:new Date(selected.created_at).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})},
  ].map(f => (
                    <div key={f.l}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.l}</p>
                      <p className="text-slate-800 font-semibold text-sm break-all">{f.v}</p>
                    </div>
                  ))}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Issue</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{cleanIssue(selected.issue)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

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
    home:   <LandingPage onNavigate={setPage} />,
    issues: <IssuesPage  onNavigate={setPage} />,
    faq:    <FAQPage     onNavigate={setPage} />,
    submit: <SubmitPage  onNavigate={setPage} />,
    track:  <TrackPage   onNavigate={setPage} />,
    admin:  <AdminPage   onNavigate={setPage} />,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      {pages[page] || pages.home}
    </>
  );
  
}