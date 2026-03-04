import { useState, useRef, useEffect, useCallback } from "react";

const BLOGGER_PASS = "020226";
const VIEWER_PASS = "010526";

const STORAGE_KEY = "collegeBlogPosts";

async function loadPosts() {
  try {
    const result = localStorage.getItem(STORAGE_KEY);
    return result ? JSON.parse(result) : [];
  } catch {
    return [];
  }
}

async function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error("Storage error", e);
  }
}

function GoldParticles() {
  return (
    <div className="particles" aria-hidden="true">
      {[...Array(18)].map((_, i) => (
        <span key={i} className={`particle particle-${i}`} />
      ))}
    </div>
  );
}

function PasswordGate({ onUnlock, role }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState("");
  const correct = role === "blogger" ? BLOGGER_PASS : VIEWER_PASS;

  const attempt = () => {
    if (input === correct) {
      onUnlock();
    } else {
      setShake(true);
      setHint("Incorrect password. Try again.");
      setTimeout(() => setShake(false), 600);
      setInput("");
    }
  };

  return (
    <div className="gate-wrap">
      <GoldParticles />
      <div className={`gate-card ${shake ? "shake" : ""}`}>
        <div className="gate-crown">✦</div>
        <h2 className="gate-title">{role === "blogger" ? "Blogger Access" : "Visitor Access"}</h2>
        <p className="gate-sub">{role === "blogger" ? "Enter your secret key to manage the blog." : "Enter your access code to explore."}</p>
        <div className="gate-input-wrap">
          <input
            type="password"
            className="gate-input"
            placeholder="••••••"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            maxLength={10}
            autoFocus
          />
          <button className="gate-btn" onClick={attempt}>ENTER</button>
        </div>
        {hint && <p className="gate-hint">{hint}</p>}
      </div>
    </div>
  );
}

function LandingPage({ onEnterViewer, onEnterBlogger }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div className={`landing ${visible ? "fade-in" : ""}`}>
      <GoldParticles />
      <header className="landing-header">
        <div className="logo-mark">University of Central Florida</div>
        <nav className="landing-nav">
          <button className="nav-btn" onClick={onEnterViewer}>View Blog</button>
          <button className="nav-btn nav-btn-gold" onClick={onEnterBlogger}>Blogger Login</button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-tag">An exchange student story</div>
        <h1 className="hero-title">
          <span className="line1">A semester</span>
          <span className="line2">at <em>UCF</em></span>
        </h1>
        <p className="hero-desc">
          A visual journal and blog, documenting my beautiful and unforgettable time at UCF and the theme park capital, Orlando.
        </p>
        <button className="cta-btn" onClick={onEnterViewer}>
          <span>Explore the Blog</span>
          <span className="cta-arrow">→</span>
        </button>
      </section>

      <section className="features">
        {[
          { icon: "📸", title: "Visual Stories", desc: "Capturing and describing moments of my short stay at the US" },
          { icon: "🎓", title: "Campus Life", desc: "Chronicles of the amazing academics and the people at UCF" },
          { icon: "✨", title: "Curated Moments", desc: "Handpicked highlights from the most vibrant timeof my life." },
        ].map((f, i) => (
          <div className="feature-card" key={i} style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        <span>Spring 2026</span>
        <span className="footer-divider">✦</span>
        <span>Memories that last a lifetime</span>
      </footer>
    </div>
  );
}

function BloggerDashboard({ posts, setPosts, onBack }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const prevs = selected.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
      name: f.name,
    }));
    setPreviews(prevs);
  };

  const handleSubmit = async () => {
    if (!title.trim() || files.length === 0) return;
    setUploading(true);

    const mediaItems = files.map(f => ({
  data: URL.createObjectURL(f),
  type: f.type.startsWith("video") ? "video" : "image",
  name: f.name,
}));

    const post = {
      id: Date.now(),
      title,
      desc,
      media: mediaItems,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    };

    const updated = [post, ...posts];
    setPosts(updated);
    await savePosts(updated);
    setUploading(false);
    setSuccess(true);
    setTitle(""); setDesc(""); setFiles([]); setPreviews([]);
    setTimeout(() => setSuccess(false), 3000);
  };

  const deletePost = async (id) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    await savePosts(updated);
  };

  return (
    <div className="dashboard">
      <GoldParticles />
      <header className="dash-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="logo-mark small">University of Central Flordia</div>
        <div className="dash-tag">Blogger Studio</div>
      </header>

      <div className="dash-content">
        <div className="upload-panel">
          <h2 className="panel-title">New Post</h2>
          <div className="field">
            <label className="field-label">Title</label>
            <input className="field-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this moment a name..." />
          </div>
          <div className="field">
            <label className="field-label">Description</label>
            <textarea className="field-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell the story behind it..." rows={4} />
          </div>
          <div className="field">
            <label className="field-label">Media (Images / Videos)</label>
            <div className="drop-zone" onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }} onChange={handleFiles} />
              <div className="drop-icon">⬆</div>
              <p className="drop-text">Click to open file browser</p>
              <p className="drop-sub">Supports images & videos • Multiple files allowed</p>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((p, i) => (
                <div className="preview-item" key={i}>
                  {p.type === "video"
                    ? <video src={p.url} className="preview-media" muted controls/>
                    : <img src={p.url} className="preview-media" alt="" />}
                  <span className="preview-label">{p.name}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className={`submit-btn ${uploading ? "loading" : ""} ${success ? "success" : ""}`}
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Publishing..." : success ? "✓ Published!" : "Publish Post"}
          </button>
        </div>

        <div className="posts-panel">
          <h2 className="panel-title">Published Posts <span className="post-count">{posts.length}</span></h2>
          {posts.length === 0 && <p className="empty-msg">No posts yet. Create your first one!</p>}
          <div className="post-list">
            {posts.map(post => (
              <div className="post-card" key={post.id}>
                <div className="post-card-thumb">
                  {post.media[0]?.type === "video"
                    ? <video src={post.media[0].data} className="thumb-media" muted controls/>
                    : <img src={post.media[0]?.data} className="thumb-media" alt="" />}
                  {post.media.length > 1 && <span className="media-count">+{post.media.length - 1}</span>}
                </div>
                <div className="post-card-info">
                  <h3 className="post-card-title">{post.title}</h3>
                  <p className="post-card-date">{post.date}</p>
                  <p className="post-card-desc">{post.desc?.slice(0, 80)}{post.desc?.length > 80 ? "…" : ""}</p>
                </div>
                <button className="delete-btn" onClick={() => deletePost(post.id)} title="Delete">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewerSide({ posts, onBack }) {
  const [selected, setSelected] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const openPost = (post) => { setSelected(post); setImgIdx(0); };
  const closePost = () => setSelected(null);

  const download = (item) => {
    const a = document.createElement("a");
    a.href = item.data;
    a.download = item.name || "media";
    a.click();
  };

  return (
    <div className={`viewer ${visible ? "fade-in" : ""}`}>
      <GoldParticles />
      <header className="viewer-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="logo-mark small">University of Central Florida</div>
        <div className="dash-tag">Reader View</div>
      </header>

      {posts.length === 0 && (
        <div className="empty-viewer">
          <div className="empty-icon">📷</div>
          <p>No posts published yet. Check back soon!</p>
        </div>
      )}

      <div className="viewer-grid">
        {posts.map((post, i) => (
          <div className="viewer-card" key={post.id} style={{ animationDelay: `${i * 0.08}s` }} onClick={() => openPost(post)}>
            <div className="viewer-card-media">
              {post.media[0]?.type === "video"
                ? <video src={post.media[0].data} className="viewer-thumb" muted controls/>
                : <img src={post.media[0]?.data} className="viewer-thumb" alt={post.title} />}
              {post.media.length > 1 && <span className="viewer-count">🖼 {post.media.length}</span>}
              <div className="viewer-overlay">
                <span className="view-label">View Post</span>
              </div>
            </div>
            <div className="viewer-card-body">
              <h3 className="viewer-card-title">{post.title}</h3>
              <p className="viewer-card-date">{post.date}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="lightbox" onClick={closePost}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lb-close" onClick={closePost}>✕</button>

            <div className="lb-media-wrap">
              <div className="lb-media-stage">
                {selected.media[imgIdx]?.type === "video"
                  ? <video src={selected.media[imgIdx].data} className="lb-media" controls />
                  : (
                    <div className="lb-img-wrap">
                      <img src={selected.media[imgIdx]?.data} className="lb-media" alt="" />
                      <div className="lb-download-overlay" onClick={() => download(selected.media[imgIdx])}>
                        <span className="lb-dl-icon">⬇</span>
                        <span>Download</span>
                      </div>
                    </div>
                  )}
              </div>
              {selected.media.length > 1 && (
                <div className="lb-thumbs">
                  {selected.media.map((m, i) => (
                    <div
                      key={i}
                      className={`lb-thumb ${i === imgIdx ? "active" : ""}`}
                      onClick={() => setImgIdx(i)}
                    >
                      {m.type === "video"
                        ? <video src={m.data} className="lb-thumb-media" muted controls/>
                        : <img src={m.data} className="lb-thumb-media" alt="" />}
                    </div>
                  ))}
                </div>
              )}
              {selected.media.length > 1 && (
                <div className="lb-nav">
                  <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} disabled={imgIdx === 0}>‹</button>
                  <span>{imgIdx + 1} / {selected.media.length}</span>
                  <button onClick={() => setImgIdx(i => Math.min(selected.media.length - 1, i + 1))} disabled={imgIdx === selected.media.length - 1}>›</button>
                </div>
              )}
            </div>

            <div className="lb-info">
              <div className="lb-date">{selected.date}</div>
              <h2 className="lb-title">{selected.title}</h2>
              {selected.desc && <p className="lb-desc">{selected.desc}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | viewer-gate | blogger-gate | viewer | blogger
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPosts().then(p => { setPosts(p); setLoaded(true); });
  }, []);

  if (!loaded) return <div className="app-loading">Loading…</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black: #0a0a0a;
          --dark: #111111;
          --card: #161616;
          --border: #2a2208;
          --gold: #c9a227;
          --gold-light: #e8c84a;
          --gold-dim: #7a6118;
          --yellow: #f5d060;
          --text: #e8dfc0;
          --text-dim: #9a8a60;
          --white: #faf5e4;
          --ff-display: 'Playfair Display', serif;
          --ff-body: 'Cormorant Garamond', serif;
          --ff-mono: 'Space Mono', monospace;
        }

        html, body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        body {
          background: var(--black);
          color: var(--text);
          font-family: var(--ff-body);
        }

        /* PARTICLES */
        .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .particle {
          position: absolute;
          width: 3px; height: 3px;
          background: var(--gold);
          border-radius: 50%;
          opacity: 0;
          animation: floatUp 8s infinite ease-in-out;
        }
        ${[...Array(18)].map((_, i) => `
          .particle-${i} {
            left: ${5 + i * 5.5}%;
            animation-delay: ${i * 0.45}s;
            animation-duration: ${6 + (i % 5)}s;
            width: ${2 + (i % 3)}px;
            height: ${2 + (i % 3)}px;
            opacity: 0;
          }
        `).join("")}
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          10% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }

        /* GATE */
        .gate-wrap {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at 50% 30%, #1a1200 0%, #0a0a0a 70%);
          position: relative;
        }
        .gate-card {
          background: linear-gradient(145deg, #161205, #0f0f0f);
          border: 1px solid var(--gold-dim);
          border-radius: 4px;
          padding: 3rem 2.5rem;
          width: 380px;
          max-width: 95vw;
          text-align: center;
          position: relative;
          z-index: 2;
          box-shadow: 0 0 60px rgba(201,162,39,0.12), 0 0 120px rgba(201,162,39,0.04);
          animation: cardReveal 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gate-crown { font-size: 2rem; color: var(--gold); margin-bottom: 0.5rem; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        .gate-title { font-family: var(--ff-display); font-size: 1.6rem; color: var(--white); margin-bottom: 0.4rem; }
        .gate-sub { font-size: 1rem; color: var(--text-dim); margin-bottom: 2rem; font-family: var(--ff-body); }
        .gate-input-wrap { display: flex; gap: 0; border: 1px solid var(--gold-dim); border-radius: 2px; overflow: hidden; }
        .gate-input {
          flex: 1; background: #0d0d0d; border: none; color: var(--white);
          padding: 0.8rem 1rem; font-size: 1.1rem; outline: none; font-family: var(--ff-mono); letter-spacing: 0.3em;
        }
        .gate-input::placeholder { color: var(--gold-dim); letter-spacing: 0.2em; }
        .gate-btn {
          background: var(--gold); color: var(--black); border: none; padding: 0 1.4rem;
          font-family: var(--ff-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
          cursor: pointer; transition: background 0.2s;
        }
        .gate-btn:hover { background: var(--gold-light); }
        .gate-hint { margin-top: 1rem; font-size: 0.85rem; color: #e06060; }
        .shake { animation: shake 0.5s ease; }
        @keyframes shake {
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-8px);}
          40%{transform:translateX(8px);}
          60%{transform:translateX(-5px);}
          80%{transform:translateX(5px);}
        }

        /* LANDING */
        .landing {
          min-height: 100vh; position: relative; overflow: hidden;
          background: radial-gradient(ellipse at 30% 20%, #1c1400 0%, #0a0a0a 60%);
          opacity: 0; transition: opacity 0.8s;
        }
        .landing.fade-in { opacity: 1; }
        .landing-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 4rem; border-bottom: 1px solid var(--border);
          position: relative; z-index: 2;
        }
        .logo-mark {
          font-family: var(--ff-mono); font-size: 0.85rem; letter-spacing: 0.2em;
          color: var(--gold); text-transform: uppercase;
        }
        .logo-mark.small { font-size: 0.75rem; }
        .landing-nav { display: flex; gap: 1rem; }
        .nav-btn {
          background: transparent; border: 1px solid var(--gold-dim); color: var(--text-dim);
          padding: 0.5rem 1.2rem; font-family: var(--ff-mono); font-size: 0.75rem; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: all 0.2s;
        }
        .nav-btn:hover { border-color: var(--gold); color: var(--gold); }
        .nav-btn-gold { background: var(--gold); color: var(--black); border-color: var(--gold); }
        .nav-btn-gold:hover { background: var(--gold-light); color: var(--black); }

        .hero {
          padding: 8rem 4rem 5rem;
          position: relative; z-index: 2;
          max-width: 800px;
        }
        .hero-tag {
          font-family: var(--ff-mono); font-size: 0.72rem; letter-spacing: 0.25em;
          color: var(--gold); text-transform: uppercase; margin-bottom: 1.5rem;
          animation: slideIn 0.8s 0.2s both;
        }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .hero-title {
          font-family: var(--ff-display); font-size: clamp(3rem, 8vw, 6.5rem); line-height: 1.05;
          color: var(--white); display: flex; flex-direction: column; margin-bottom: 1.5rem;
        }
        .line1 { animation: slideIn 0.8s 0.3s both; }
        .line2 { animation: slideIn 0.8s 0.45s both; }
        .hero-title em { color: var(--gold); font-style: italic; }
        .hero-desc {
          font-size: 1.2rem; color: var(--text-dim); line-height: 1.8; max-width: 520px;
          margin-bottom: 2.5rem; animation: slideIn 0.8s 0.6s both;
        }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 0.8rem;
          background: transparent; border: 2px solid var(--gold); color: var(--gold);
          padding: 1rem 2rem; font-family: var(--ff-mono); font-size: 0.85rem; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: all 0.3s;
          animation: slideIn 0.8s 0.75s both;
        }
        .cta-btn:hover { background: var(--gold); color: var(--black); transform: translateX(4px); }
        .cta-arrow { transition: transform 0.3s; }
        .cta-btn:hover .cta-arrow { transform: translateX(6px); }

        .features {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          margin: 2rem 0; position: relative; z-index: 2;
          background: var(--border);
        }
        .feature-card {
          background: var(--dark); padding: 2.5rem 3rem;
          animation: fadeUp 0.7s both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .feature-card:hover { background: #141005; }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
        .feature-title { font-family: var(--ff-display); font-size: 1.1rem; color: var(--white); margin-bottom: 0.5rem; }
        .feature-desc { font-size: 0.95rem; color: var(--text-dim); line-height: 1.7; }

        .landing-footer {
          display: flex; align-items: center; justify-content: center; gap: 1.5rem;
          padding: 1.5rem; font-family: var(--ff-mono); font-size: 0.7rem;
          color: var(--gold-dim); letter-spacing: 0.1em; position: relative; z-index: 2;
        }
        .footer-divider { color: var(--gold); }

        /* DASHBOARD */
        .dashboard {
          min-height: 100vh; position: relative;
          background: radial-gradient(ellipse at 70% 10%, #1a1200 0%, #0a0a0a 55%);
        }
        .dash-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 3rem; border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 10; background: rgba(10,10,10,0.95);
          backdrop-filter: blur(10px);
        }
        .back-btn {
          background: none; border: none; color: var(--gold-dim); cursor: pointer;
          font-family: var(--ff-mono); font-size: 0.8rem; letter-spacing: 0.1em; transition: color 0.2s;
        }
        .back-btn:hover { color: var(--gold); }
        .dash-tag { font-family: var(--ff-mono); font-size: 0.7rem; color: var(--text-dim); letter-spacing: 0.15em; text-transform: uppercase; }

        .dash-content {
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 0;
          min-height: calc(100vh - 60px); position: relative; z-index: 2;
        }
        .upload-panel {
          padding: 2.5rem; border-right: 1px solid var(--border);
          background: #0d0d0d;
        }
        .posts-panel { padding: 2.5rem; }
        .panel-title {
          font-family: var(--ff-display); font-size: 1.4rem; color: var(--white);
          margin-bottom: 1.8rem; display: flex; align-items: center; gap: 0.8rem;
          border-bottom: 1px solid var(--border); padding-bottom: 0.8rem;
        }
        .post-count {
          background: var(--gold); color: var(--black); font-family: var(--ff-mono);
          font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px;
        }
        .field { margin-bottom: 1.4rem; }
        .field-label { display: block; font-family: var(--ff-mono); font-size: 0.7rem; letter-spacing: 0.12em; color: var(--gold); text-transform: uppercase; margin-bottom: 0.5rem; }
        .field-input, .field-textarea {
          width: 100%; background: #0a0a0a; border: 1px solid var(--border);
          color: var(--text); padding: 0.7rem 1rem; font-family: var(--ff-body); font-size: 1rem;
          outline: none; border-radius: 2px; transition: border-color 0.2s; resize: vertical;
        }
        .field-input:focus, .field-textarea:focus { border-color: var(--gold-dim); }
        .field-input::placeholder, .field-textarea::placeholder { color: var(--text-dim); }

        .drop-zone {
          border: 2px dashed var(--gold-dim); border-radius: 4px;
          padding: 2rem; text-align: center; cursor: pointer;
          transition: all 0.3s; background: #0a0a0a;
        }
        .drop-zone:hover { border-color: var(--gold); background: #111005; }
        .drop-icon { font-size: 2rem; color: var(--gold); margin-bottom: 0.5rem; }
        .drop-text { color: var(--text); font-size: 1rem; }
        .drop-sub { color: var(--text-dim); font-size: 0.82rem; margin-top: 0.3rem; }

        .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; margin: 1rem 0; }
        .preview-item { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 2px; border: 1px solid var(--border); }
        .preview-media { width: 100%; height: 100%; object-fit: cover; }
        .preview-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); font-size: 0.6rem; color: var(--text-dim); padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .submit-btn {
          width: 100%; padding: 0.9rem; background: var(--gold); color: var(--black);
          border: none; font-family: var(--ff-mono); font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; border-radius: 2px;
          transition: all 0.3s; margin-top: 0.5rem;
        }
        .submit-btn:hover { background: var(--gold-light); }
        .submit-btn.success { background: #3a7a3a; color: #fff; }
        .submit-btn.loading { opacity: 0.6; cursor: not-allowed; }

        .empty-msg { color: var(--text-dim); font-style: italic; font-size: 1rem; }
        .post-list { display: flex; flex-direction: column; gap: 1rem; }
        .post-card {
          display: flex; gap: 1rem; align-items: flex-start;
          background: #0d0d0d; border: 1px solid var(--border); border-radius: 3px;
          padding: 0.8rem; position: relative; transition: border-color 0.2s;
        }
        .post-card:hover { border-color: var(--gold-dim); }
        .post-card-thumb { width: 70px; height: 70px; flex-shrink: 0; overflow: hidden; border-radius: 2px; position: relative; }
        .thumb-media { width: 100%; height: 100%; object-fit: cover; }
        .media-count { position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.8); color: var(--gold); font-family: var(--ff-mono); font-size: 0.6rem; padding: 1px 4px; border-radius: 2px; }
        .post-card-info { flex: 1; min-width: 0; }
        .post-card-title { font-family: var(--ff-display); font-size: 0.95rem; color: var(--white); margin-bottom: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .post-card-date { font-family: var(--ff-mono); font-size: 0.65rem; color: var(--gold-dim); margin-bottom: 0.3rem; }
        .post-card-desc { font-size: 0.82rem; color: var(--text-dim); line-height: 1.5; }
        .delete-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 0.8rem; padding: 0.3rem; transition: color 0.2s; flex-shrink: 0; }
        .delete-btn:hover { color: #e06060; }

        /* VIEWER */
        .viewer {
          min-height: 100vh; position: relative;
          background: radial-gradient(ellipse at 60% 20%, #14110a 0%, #0a0a0a 60%);
          opacity: 0; transition: opacity 0.8s;
        }
        .viewer.fade-in { opacity: 1; }
        .viewer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 3rem; border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 10; background: rgba(10,10,10,0.95);
          backdrop-filter: blur(10px);
        }
        .empty-viewer {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 60vh; color: var(--text-dim); font-size: 1.1rem; gap: 1rem;
        }
        .empty-icon { font-size: 3rem; }
        .viewer-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5px; padding: 0; background: var(--border);
          position: relative; z-index: 2;
        }
        .viewer-card {
          background: var(--dark); overflow: hidden; cursor: pointer;
          animation: fadeUp 0.5s both; transition: transform 0.3s;
        }
        .viewer-card:hover { transform: scale(1.01); z-index: 3; }
        .viewer-card-media { position: relative; aspect-ratio: 4/3; overflow: hidden; }
        .viewer-thumb { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .viewer-card:hover .viewer-thumb { transform: scale(1.06); }
        .viewer-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .viewer-card:hover .viewer-overlay { opacity: 1; }
        .view-label { font-family: var(--ff-mono); font-size: 0.75rem; letter-spacing: 0.15em; color: var(--gold); border: 1px solid var(--gold); padding: 0.4rem 1rem; text-transform: uppercase; }
        .viewer-count { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.8); color: var(--gold); font-family: var(--ff-mono); font-size: 0.65rem; padding: 2px 6px; border-radius: 2px; }
        .viewer-card-body { padding: 1rem 1.2rem; border-top: 1px solid var(--border); }
        .viewer-card-title { font-family: var(--ff-display); font-size: 1rem; color: var(--white); margin-bottom: 0.2rem; }
        .viewer-card-date { font-family: var(--ff-mono); font-size: 0.65rem; color: var(--gold-dim); }

        /* LIGHTBOX */
        .lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.93);
          z-index: 100; display: flex; align-items: center; justify-content: center;
          padding: 2rem; animation: lbIn 0.3s ease;
        }
        @keyframes lbIn { from{opacity:0} to{opacity:1} }
        .lightbox-inner {
          display: grid; grid-template-columns: 1fr 320px;
          background: var(--card); border: 1px solid var(--border); border-radius: 4px;
          max-width: 1100px; width: 100%; max-height: 90vh; overflow: hidden;
          position: relative; animation: lbSlide 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes lbSlide { from{transform:translateY(30px);opacity:0} to{transform:none;opacity:1} }
        .lb-close {
          position: absolute; top: 1rem; right: 1rem; z-index: 10;
          background: rgba(0,0,0,0.7); border: 1px solid var(--border); color: var(--text);
          width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .lb-close:hover { background: #333; color: var(--gold); }
        .lb-media-wrap { display: flex; flex-direction: column; background: #080808; overflow-y: auto; }
        .lb-media-stage { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 300px; position: relative; }
        .lb-img-wrap { position: relative; display: inline-block; max-width: 100%; max-height: 70vh; }
        .lb-media { max-width: 100%; max-height: 65vh; object-fit: contain; display: block; }
        .lb-download-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.4rem; opacity: 0; transition: opacity 0.3s; cursor: pointer;
          color: var(--gold); font-family: var(--ff-mono); font-size: 0.8rem; letter-spacing: 0.1em;
        }
        .lb-img-wrap:hover .lb-download-overlay { opacity: 1; }
        .lb-dl-icon { font-size: 1.8rem; }
        .lb-thumbs { display: flex; gap: 6px; padding: 0.8rem; background: #0a0a0a; overflow-x: auto; }
        .lb-thumb {
          width: 56px; height: 56px; flex-shrink: 0; cursor: pointer; overflow: hidden;
          border-radius: 2px; border: 2px solid transparent; opacity: 0.6; transition: all 0.2s;
        }
        .lb-thumb.active { border-color: var(--gold); opacity: 1; }
        .lb-thumb:hover { opacity: 0.9; }
        .lb-thumb-media { width: 100%; height: 100%; object-fit: cover; }
        .lb-nav {
          display: flex; align-items: center; justify-content: center; gap: 1rem;
          padding: 0.6rem; border-top: 1px solid var(--border); background: #0a0a0a;
          font-family: var(--ff-mono); font-size: 0.75rem; color: var(--text-dim);
        }
        .lb-nav button {
          background: none; border: 1px solid var(--border); color: var(--text); width: 28px; height: 28px;
          cursor: pointer; font-size: 1rem; border-radius: 2px; transition: all 0.2s;
        }
        .lb-nav button:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
        .lb-nav button:disabled { opacity: 0.3; cursor: default; }
        .lb-info { padding: 2.5rem 2rem; border-left: 1px solid var(--border); overflow-y: auto; display: flex; flex-direction: column; }
        .lb-date { font-family: var(--ff-mono); font-size: 0.65rem; color: var(--gold-dim); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.8rem; }
        .lb-title { font-family: var(--ff-display); font-size: 1.6rem; color: var(--white); line-height: 1.25; margin-bottom: 1.2rem; }
        .lb-desc { font-size: 1rem; color: var(--text-dim); line-height: 1.8; }

        .app-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: var(--gold); font-family: var(--ff-mono); font-size: 0.85rem; letter-spacing: 0.2em; }

        @media (max-width: 768px) {
          .landing-header { padding: 1rem; }
          .hero { padding: 4rem 1.5rem 2rem; }
          .features { grid-template-columns: 1fr; }
          .dash-content { grid-template-columns: 1fr; }
          .upload-panel { border-right: none; border-bottom: 1px solid var(--border); }
          .lightbox-inner { grid-template-columns: 1fr; }
          .lb-info { border-left: none; border-top: 1px solid var(--border); }
        }
      `}</style>

      {screen === "landing" && (
        <LandingPage
          onEnterViewer={() => setScreen("viewer-gate")}
          onEnterBlogger={() => setScreen("blogger-gate")}
        />
      )}
      {screen === "viewer-gate" && (
        <PasswordGate role="viewer" onUnlock={() => setScreen("viewer")} />
      )}
      {screen === "blogger-gate" && (
        <PasswordGate role="blogger" onUnlock={() => setScreen("blogger")} />
      )}
      {screen === "viewer" && (
        <ViewerSide posts={posts} onBack={() => setScreen("landing")} />
      )}
      {screen === "blogger" && (
        <BloggerDashboard posts={posts} setPosts={setPosts} onBack={() => setScreen("landing")} />
      )}
    </>
  );
}