import React, { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary";
import "./App.css";

const BLOG_PASS = "blog123";
const VIEW_PASS = "view123";

function StarDust() {
  return (
    <div className="dust-layer" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className={`dust dust-${i + 1}`} />
      ))}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("home");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [pass, setPass] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const snapshot = await getDocs(collection(db, "blogs"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setPosts(data);
  }

  async function createPost() {
    if (!title || !desc) {
      alert("Fill title and description");
      return;
    }

    const media = [];
    for (const f of files) {
      const uploaded = await uploadToCloudinary(f);
      media.push(uploaded);
    }

    await addDoc(collection(db, "blogs"), {
      title,
      desc,
      media,
      date: new Date().toLocaleString(),
      createdAt: Date.now(),
    });

    setTitle("");
    setDesc("");
    setFiles([]);
    await loadPosts();
    alert("Uploaded!");
  }

  async function deletePost(id) {
    await deleteDoc(doc(db, "blogs", id));
    await loadPosts();
  }

  function goHome() {
    setPass("");
    setMode("home");
  }

  function loginBlogger() {
    if (pass === BLOG_PASS) {
      setPass("");
      setMode("blogger");
      return;
    }
    alert("Wrong Password");
  }

  function loginViewer() {
    if (pass === VIEW_PASS) {
      setPass("");
      setMode("viewer");
      return;
    }
    alert("Wrong Password");
  }

  const stats = useMemo(() => {
    const imageCount = posts.reduce(
      (count, p) => count + (p.media?.filter((m) => m.type === "image").length || 0),
      0
    );
    const videoCount = posts.reduce(
      (count, p) => count + (p.media?.filter((m) => m.type === "video").length || 0),
      0
    );
    return { imageCount, videoCount };
  }, [posts]);

  if (mode === "home") {
    return (
      <main className="app-shell cinema-bg home-page">
        <StarDust />

        <header className="landing-nav animate-fade">
          <div className="brand-mark">? CAMPUS CHRONICLES ?</div>
          <div className="nav-actions">
            <button className="btn btn-outline" onClick={() => setMode("viewerLogin")}>
              View Blog
            </button>
            <button className="btn btn-gold" onClick={() => setMode("blogLogin")}>
              Blogger Login
            </button>
          </div>
        </header>

        <section className="landing-hero animate-rise">
          <p className="hero-kicker">EST. 2024 · A COLLEGE STORY</p>
          <h1>
            Life Between
            <br />
            the <span>Lectures</span>
          </h1>
          <p className="hero-description">
            A visual journal documenting the beautifully chaotic, unforgettable world of college,
            from late nights to first milestones.
          </p>
          <button className="btn btn-outline hero-cta" onClick={() => setMode("viewerLogin")}>
            Explore The Blog ?
          </button>
        </section>
      </main>
    );
  }

  if (mode === "blogLogin" || mode === "viewerLogin") {
    const isBlogger = mode === "blogLogin";

    const submitAccess = (e) => {
      e.preventDefault();
      if (isBlogger) {
        loginBlogger();
      } else {
        loginViewer();
      }
    };

    return (
      <main className="app-shell cinema-bg center-page">
        <StarDust />

        <header className="landing-nav animate-fade compact-nav">
          <div className="brand-mark">? CAMPUS CHRONICLES ?</div>
          <button className="btn btn-outline" onClick={goHome}>
            Back
          </button>
        </header>

        <section className="access-card animate-rise">
          <div className="access-star">?</div>
          <h2>{isBlogger ? "Blogger Access" : "Visitor Access"}</h2>
          <p>{isBlogger ? "Enter your editorial code." : "Enter your access code to explore."}</p>

          <form className="access-form" onSubmit={submitAccess}>
            <input
              className="field access-input"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••"
            />
            <button className="access-submit" type="submit">
              {isBlogger ? "LOGIN" : "ENTER"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (mode === "blogger") {
    return (
      <main className="app-shell app-wide cinema-bg dashboard-page">
        <StarDust />

        <header className="top-bar animate-fade">
          <h2>Content Management</h2>
          <button className="btn btn-outline" onClick={goHome}>
            Back
          </button>
        </header>

        <section className="panel composer animate-rise">
          <h3>Create Post</h3>
          <input
            className="field"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="field field-textarea"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <label className="upload-box">
            <span>Upload images/videos</span>
            <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
          </label>
          <p className="file-count">{files.length} file(s) selected</p>
          <button className="btn btn-gold" onClick={createPost}>
            Upload
          </button>
        </section>

        <section className="panel animate-rise">
          <h3>Your Posts</h3>
          {posts.length === 0 && <p className="empty-state">No posts yet.</p>}
          <div className="post-grid">
            {posts.map((p) => (
              <article key={p.id} className="post-card">
                <div className="post-head">
                  <h4>{p.title}</h4>
                  <span>{p.date || "No date"}</span>
                </div>
                <p>{p.desc}</p>
                <div className="media-grid">
                  {p.media?.map((m, i) => {
                    if (m.type === "image") {
                      return <img key={i} src={m.url} alt="Post media" className="media-thumb" />;
                    }
                    if (m.type === "video") {
                      return <video key={i} src={m.url} className="media-thumb" controls />;
                    }
                    return null;
                  })}
                </div>
                <button className="btn btn-danger" onClick={() => deletePost(p.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (mode === "viewer") {
    return (
      <main className="app-shell app-wide cinema-bg dashboard-page">
        <StarDust />

        <header className="top-bar animate-fade">
          <h2>Viewer Gallery</h2>
          <button className="btn btn-outline" onClick={goHome}>
            Back
          </button>
        </header>

        <section className="panel stats-panel animate-rise">
          <div className="stat-card">
            <span>Total Posts</span>
            <strong>{posts.length}</strong>
          </div>
          <div className="stat-card">
            <span>Images</span>
            <strong>{stats.imageCount}</strong>
          </div>
          <div className="stat-card">
            <span>Videos</span>
            <strong>{stats.videoCount}</strong>
          </div>
        </section>

        <section className="panel animate-rise">
          <h3>All Blogs</h3>
          {posts.length === 0 && <p className="empty-state">No posts yet.</p>}

          <div className="post-grid viewer-grid">
            {posts.map((p) => {
              const images = p.media?.filter((m) => m.type === "image") || [];
              const videos = p.media?.filter((m) => m.type === "video") || [];
              return (
                <article key={p.id} className="post-card viewer-card">
                  <div className="post-head">
                    <h4>{p.title}</h4>
                    <span>{p.date || "No date"}</span>
                  </div>
                  <p>{p.desc}</p>

                  <div className="viewer-section">
                    <div className="viewer-section-title">Images ({images.length})</div>
                    {images.length === 0 && <p className="media-empty">No images uploaded.</p>}
                    <div className="media-grid">
                      {images.map((m, i) => (
                        <img key={i} src={m.url} alt="Blog visual" className="media-thumb" />
                      ))}
                    </div>
                  </div>

                  <div className="viewer-section">
                    <div className="viewer-section-title">Videos ({videos.length})</div>
                    {videos.length === 0 && <p className="media-empty">No videos uploaded.</p>}
                    <div className="media-grid video-grid">
                      {videos.map((m, i) => (
                        <video key={i} src={m.url} className="media-thumb" controls />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  return null;
}
