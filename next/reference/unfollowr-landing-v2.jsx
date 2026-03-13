import { useState } from "react";
import { Upload, ChevronDown, Shield, WifiOff, Layers, Lock, EyeOff, FileText, X, ArrowRight, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

const tokens = {
  bg: "#FAFBFC",
  surface: "#FFFFFF",
  surface2: "#F5F7FA",
  text: "#111827",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primarySoft: "rgba(37,99,235,0.08)",
  success: "#059669",
  successSoft: "rgba(5,150,105,0.08)",
  danger: "#DC2626",
  dangerSoft: "rgba(220,38,38,0.07)",
};

const container = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" };
const containerNarrow = { maxWidth: 720, margin: "0 auto", padding: "0 24px" };

export default function UnfollowrLanding() {
  const [openFaq, setOpenFaq] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const faqItems = [
    { q: "Is my Instagram data private and secure?", a: "Yes. Unfollowr processes your files entirely in your browser. Nothing is uploaded to any server — your data stays on your device." },
    { q: "How is this safer than other unfollower apps?", a: "Most apps require your Instagram login, which risks your account. Unfollowr uses Instagram's official data export instead — no passwords, no API access, no account risk." },
    { q: "How do I download my Instagram data?", a: "Go to Instagram Settings → Accounts Center → Your information and permissions → Download your information. Select Followers and Following in JSON or HTML format." },
    { q: "Do I need to log into Instagram to use this?", a: "No. You never enter your Instagram credentials. You only upload the data export files that Instagram gives you." },
    { q: "Does it work on mobile?", a: "Yes. The upload and results pages work on any modern mobile browser. Just make sure you can access your Instagram export files on your device." },
  ];

  const steps = [
    { num: "1", title: "Export your data", desc: "Download your Followers & Following files from Instagram's settings." },
    { num: "2", title: "Upload here", desc: "Drag and drop both files into Unfollowr. We accept JSON and HTML." },
    { num: "3", title: "See results", desc: "Instantly see who doesn't follow you back, sorted by category." },
  ];

  const whyFeatures = [
    { icon: Lock, title: "No Login", desc: "Never enter your Instagram password" },
    { icon: Shield, title: "100% Private", desc: "All processing happens locally in your browser" },
    { icon: FileText, title: "Official Data", desc: "Uses Instagram's official data export" },
    { icon: Zap, title: "Smart Analysis", desc: "Intelligent suggestions on who to unfollow" },
  ];

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn-primary {
          background: ${tokens.primary}; color: white; border: none;
          padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center;
          gap: 10px; font-family: inherit;
          box-shadow: 0 1px 3px rgba(37,99,235,0.2), 0 4px 12px rgba(37,99,235,0.12);
        }
        .btn-primary:hover { background: ${tokens.primaryHover}; box-shadow: 0 2px 6px rgba(37,99,235,0.25), 0 8px 20px rgba(37,99,235,0.15); transform: translateY(-1px); }
        .btn-ghost {
          background: transparent; color: ${tokens.textMuted}; border: 1.5px solid ${tokens.border};
          padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center;
          gap: 8px; font-family: inherit;
        }
        .btn-ghost:hover { border-color: ${tokens.borderStrong}; color: ${tokens.text}; background: ${tokens.surface}; }
        .upload-card {
          background: ${tokens.surface}; border: 1.5px solid ${tokens.border}; border-radius: 20px;
          padding: 48px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04); transition: all 0.3s;
        }
        .upload-card:hover { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06); border-color: ${tokens.borderStrong}; }
        .dropzone {
          border: 2px dashed ${tokens.border}; border-radius: 16px; padding: 56px 32px;
          text-align: center; cursor: pointer; transition: all 0.2s; background: ${tokens.surface2};
        }
        .dropzone.active { border-color: ${tokens.primary}; background: ${tokens.primarySoft}; }
        .dropzone.has-files { border-color: ${tokens.success}; background: ${tokens.successSoft}; padding: 32px; }
        .dropzone:hover:not(.has-files) { border-color: ${tokens.borderStrong}; background: ${tokens.surface}; }
        .step-card {
          background: ${tokens.surface}; border: 1.5px solid ${tokens.border}; border-radius: 16px;
          padding: 32px 28px; transition: all 0.2s;
        }
        .step-card:hover { border-color: ${tokens.borderStrong}; box-shadow: 0 4px 16px rgba(0,0,0,0.04); transform: translateY(-2px); }
        .why-feature-card {
          background: ${tokens.surface}; border: 1.5px solid ${tokens.border}; border-radius: 14px;
          padding: 24px; transition: all 0.2s;
        }
        .why-feature-card:hover { border-color: ${tokens.borderStrong}; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .faq-item { border-bottom: 1px solid ${tokens.border}; }
        .faq-btn {
          width: 100%; background: none; border: none; padding: 22px 28px;
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 500;
          color: ${tokens.text}; text-align: left; transition: color 0.15s;
        }
        .faq-btn:hover { color: ${tokens.primary}; }
        .faq-answer { overflow: hidden; transition: max-height 0.25s ease, opacity 0.2s ease, padding 0.25s ease; }
        .file-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${tokens.surface}; border: 1px solid ${tokens.border};
          border-radius: 8px; padding: 6px 10px 6px 12px; font-size: 13px;
          color: ${tokens.text}; font-family: inherit;
        }
        .file-chip button {
          background: none; border: none; cursor: pointer; color: ${tokens.textFaint};
          display: flex; padding: 2px; border-radius: 4px; transition: all 0.15s;
        }
        .file-chip button:hover { color: ${tokens.text}; background: ${tokens.surface2}; }
        .trust-strip { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
        .trust-item { display: flex; align-items: center; gap: 10px; color: ${tokens.textMuted}; font-size: 14px; }

        @media (max-width: 768px) {
          .upload-card { padding: 28px 20px; }
          .dropzone { padding: 40px 20px; }
          .steps-grid, .features-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .why-features-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-row { flex-direction: column !important; align-items: stretch !important; }
          .cta-row .btn-primary, .cta-row .btn-ghost { width: 100%; justify-content: center; }
          .trust-strip { flex-direction: column; align-items: center; gap: 16px; }
          .hero-headline { font-size: 36px !important; line-height: 42px !important; }
        }
        @media (max-width: 480px) {
          .why-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: tokens.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>U</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Unfollowr</span>
        </div>
        <a href="#how-it-works" style={{ color: tokens.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.15s" }}
          onMouseEnter={e => e.target.style.color = tokens.text} onMouseLeave={e => e.target.style.color = tokens.textMuted}>
          How it works
        </a>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ ...containerNarrow, paddingTop: 80, paddingBottom: 64, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: tokens.primarySoft, color: tokens.primary, padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
          <Shield size={14} /> No login required — 100% private
        </div>
        <h1 className="hero-headline" style={{ fontSize: 52, lineHeight: "58px", fontWeight: 700, letterSpacing: "-0.035em", color: tokens.text, marginBottom: 18 }}>
          See who doesn't<br />follow you back
        </h1>
        <p style={{ fontSize: 18, lineHeight: "28px", color: tokens.textMuted, maxWidth: 480, margin: "0 auto 36px" }}>
          Upload your Instagram export. Get instant results.<br />Your data never leaves your device.
        </p>
        <div className="cta-row" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}>
            Upload export <ArrowRight size={18} />
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
            How it works
          </button>
        </div>
      </section>

      {/* ═══ UPLOAD CARD ═══ */}
      <section id="upload" style={{ ...containerNarrow, paddingBottom: 0 }}>
        <div className="upload-card">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Upload your Instagram export</h2>
            <p style={{ fontSize: 14, color: tokens.textMuted }}>Drag & drop your Followers + Following files below</p>
          </div>
          <div
            className={`dropzone ${dragOver ? "active" : ""} ${files.length > 0 ? "has-files" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input id="file-input" type="file" multiple accept=".json,.html,.htm" style={{ display: "none" }}
              onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
            {files.length === 0 ? (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 18px", background: tokens.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={22} color={tokens.primary} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 500, color: tokens.text, marginBottom: 6 }}>Drop your files here</p>
                <p style={{ fontSize: 13, color: tokens.textFaint }}>or click to browse · JSON or HTML from Instagram's export</p>
              </>
            ) : (
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                  {files.map((f, i) => (
                    <div key={i} className="file-chip">
                      <FileText size={14} color={tokens.textMuted} />
                      <span>{f.name?.length > 28 ? f.name.slice(0, 28) + "…" : f.name || `File ${i + 1}`}</span>
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: tokens.success, fontWeight: 500 }}>{files.length} file{files.length > 1 ? "s" : ""} selected · Click to add more</p>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
            <button className="btn-primary" style={{ opacity: files.length < 2 ? 0.45 : 1, pointerEvents: files.length < 2 ? "none" : "auto", padding: "12px 28px", fontSize: 15 }}>Analyze</button>
            <button style={{ background: "none", border: "none", color: tokens.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => setFiles([{ name: "followers_1.json" }, { name: "following.json" }])}>
              Try with sample files
            </button>
          </div>
        </div>
      </section>

      {/* ═══ WHY UNFOLLOWR? ═══ */}
      <section style={{ ...container, paddingTop: 96, paddingBottom: 96 }}>
        <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left — explanation + comparison */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: tokens.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Why Unfollowr?
            </p>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16 }}>
              The safe way to check unfollowers
            </h2>
            <p style={{ fontSize: 15, color: tokens.textMuted, lineHeight: "24px", marginBottom: 32 }}>
              Most Instagram follower trackers require your login credentials or use unofficial APIs that can get your account banned. Unfollowr takes a completely different approach.
            </p>

            {/* Comparison rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Other apps — danger */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tokens.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={18} color={tokens.danger} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>Other apps</p>
                  <p style={{ fontSize: 14, color: tokens.textMuted, lineHeight: "21px" }}>
                    Require your password or use sketchy APIs that risk account bans
                  </p>
                </div>
              </div>

              {/* Unfollowr — safe */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tokens.successSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={18} color={tokens.success} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>Unfollowr</p>
                  <p style={{ fontSize: 14, color: tokens.textMuted, lineHeight: "21px" }}>
                    Uses Instagram's official data exports. Zero risk to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — 2×2 feature grid */}
          <div className="why-features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {whyFeatures.map((f, i) => (
              <div key={i} className="why-feature-card">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: tokens.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <f.icon size={19} color={tokens.primary} />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.01em" }}>{f.title}</h4>
                <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: "20px" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ ...container, paddingTop: 0, paddingBottom: 96 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>Three steps, thirty seconds</h2>
        </div>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tokens.primarySoft, color: tokens.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em" }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: tokens.textMuted, lineHeight: "22px" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ ...containerNarrow, paddingTop: 0, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>Frequently asked questions</h2>
        </div>
        <div style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 16, overflow: "hidden" }}>
          {faqItems.map((item, i) => (
            <div key={i} className="faq-item" style={i === faqItems.length - 1 ? { borderBottom: "none" } : {}}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{item.q}</span>
                <ChevronDown size={18} color={tokens.textFaint} style={{ transition: "transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", flexShrink: 0, marginLeft: 16 }} />
              </button>
              <div className="faq-answer" style={{ maxHeight: openFaq === i ? 200 : 0, opacity: openFaq === i ? 1 : 0, padding: openFaq === i ? "0 28px 22px" : "0 28px 0" }}>
                <p style={{ fontSize: 14, color: tokens.textMuted, lineHeight: "22px" }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section style={{ ...container, paddingTop: 0, paddingBottom: 56 }}>
        <div className="trust-strip">
          <div className="trust-item"><Lock size={16} /> No login required</div>
          <div className="trust-item"><Shield size={16} /> Processed locally</div>
          <div className="trust-item"><EyeOff size={16} /> Data never stored</div>
        </div>
      </section>

      {/* ═══ ABOUT / SEO ═══ */}
      <section style={{ ...containerNarrow, paddingTop: 48, paddingBottom: 48, textAlign: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: tokens.textMuted, marginBottom: 16 }}>About Unfollowr</h2>
        <p style={{ fontSize: 14, color: tokens.textFaint, lineHeight: "22px", marginBottom: 12 }}>
          Unfollowr is a free Instagram unfollower tool that helps you see who doesn't follow you back. Unlike other apps, we never ask for your Instagram login or password. Simply upload your Instagram data export, and our tool processes everything locally in your browser — your follower data never leaves your device.
        </p>
        <p style={{ fontSize: 14, color: tokens.textFaint, lineHeight: "22px" }}>
          Whether you want to track Instagram unfollowers, clean up your following list, or just see who isn't following back, Unfollowr makes it easy. Our smart categorization sorts accounts into brands, celebrities, friends, and potential spam — so you can make informed decisions about who to keep following.
        </p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: `1px solid ${tokens.border}`, padding: "28px 24px", fontSize: 13, color: tokens.textFaint }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span>© 2026 Unfollowr</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(link => (
              <a key={link} href="#" style={{ color: tokens.textFaint, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = tokens.text} onMouseLeave={e => e.target.style.color = tokens.textFaint}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
