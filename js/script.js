/**
 * script.js  –  Portfolio Frontend
 * Requires supabase-config.js loaded first
 */

/* ═══════════════════════════════════════════════
   EMAILJS CONFIG  – replace with your real keys
═══════════════════════════════════════════════ */
const EJS = {
  publicKey:       "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId:       "YOUR_EMAILJS_SERVICE_ID",
  otpTemplate:     "YOUR_OTP_TEMPLATE_ID",
  notifyTemplate:  "YOUR_NOTIFY_TEMPLATE_ID",
  contactTemplate: "YOUR_CONTACT_TEMPLATE_ID"
};
emailjs.init(EJS.publicKey);

/* ═══════════════════════════════════════════════
   1. LOADER
═══════════════════════════════════════════════ */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader")?.classList.add("hidden");
    initReveal();
  }, 1600);
});

/* ═══════════════════════════════════════════════
   2. CUSTOM CURSOR
═══════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + "px"; dot.style.top = my + "px";
  });
  (function loop() {
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll("a,button,.btn,.project-card,.skill-card").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("expanded"));
    el.addEventListener("mouseleave", () => ring.classList.remove("expanded"));
  });
})();

/* ═══════════════════════════════════════════════
   3. NAVBAR
═══════════════════════════════════════════════ */
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar?.classList.toggle("scrolled", window.scrollY > 50);
  highlightNavLink();
});

hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks?.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(l =>
  l.addEventListener("click", () => {
    hamburger?.classList.remove("open");
    navLinks?.classList.remove("open");
  })
);

function highlightNavLink() {
  let current = "";
  document.querySelectorAll("section[id]").forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  document.querySelectorAll(".nav-link").forEach(l =>
    l.classList.toggle("active", l.getAttribute("href") === "#" + current)
  );
}

/* ═══════════════════════════════════════════════
   4. THEME TOGGLE
═══════════════════════════════════════════════ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const saved = localStorage.getItem("rs-theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);
applyThemeIcon(saved);

themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("rs-theme", next);
  applyThemeIcon(next);
});
function applyThemeIcon(t) {
  if (themeIcon) themeIcon.className = t === "dark" ? "fas fa-moon" : "fas fa-sun";
}

/* ═══════════════════════════════════════════════
   5. TYPED TEXT
═══════════════════════════════════════════════ */
let typedRoles = ["Power Apps","Power Automate","Power BI","SharePoint Solutions","Azure Integrations"];
let rIdx = 0, cIdx = 0, deleting = false;
const typedEl = document.getElementById("typedText");
function typeLoop() {
  if (!typedEl) return;
  const word = typedRoles[rIdx];
  typedEl.textContent = deleting ? word.slice(0, cIdx--) : word.slice(0, cIdx++);
  if (!deleting && cIdx === word.length + 1) { deleting = true; return setTimeout(typeLoop, 1800); }
  if (deleting && cIdx === -1) { deleting = false; cIdx = 0; rIdx = (rIdx + 1) % typedRoles.length; }
  setTimeout(typeLoop, deleting ? 60 : 110);
}
setTimeout(typeLoop, 1200);

/* ═══════════════════════════════════════════════
   6. SCROLL REVEAL
═══════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target.querySelectorAll?.(".skill-bar[data-level]").forEach(b => {
        b.style.width = b.dataset.level + "%";
      });
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right").forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════
   7. TOAST
═══════════════════════════════════════════════ */
function showToast(msg, type = "info", ms = 3500) {
  const c = document.getElementById("toastContainer");
  if (!c) return;
  const icons = { success:"fa-check-circle", error:"fa-times-circle", info:"fa-info-circle", warning:"fa-exclamation-triangle" };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation="slideOutRight .3s forwards"; setTimeout(()=>t.remove(),300); }, ms);
}

/* ═══════════════════════════════════════════════
   8. UI HELPERS
═══════════════════════════════════════════════ */
function setBtnLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  const sp = btn.querySelector("span");
  if (sp) sp.textContent = label;
  btn.querySelector(".btn-spin")?.remove();
  if (loading) btn.insertAdjacentHTML("beforeend", `<i class="fas fa-spinner fa-spin btn-spin"></i>`);
}
function setStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg; el.className = `form-status ${type}`;
}
function openModal(id)  { document.getElementById(id)?.classList.add("open");    document.body.style.overflow = "hidden"; }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); document.body.style.overflow = "";       }
document.querySelectorAll(".modal-overlay").forEach(o =>
  o.addEventListener("click", e => { if (e.target === o) closeModal(o.id); })
);

/* ═══════════════════════════════════════════════
   9. LOAD SETTINGS (hero / about)
═══════════════════════════════════════════════ */
async function loadSettings() {
  try {
    const row = await getOne(TABLES.settings, "site", "key");
    if (!row?.value) return;
    const d = row.value;
    if (d.heroName)     document.getElementById("heroName").textContent    = d.heroName;
    if (d.heroDesc)     document.getElementById("heroDesc").textContent    = d.heroDesc;
    if (d.heroRoles)    typedRoles = d.heroRoles.split(",").map(r=>r.trim()).filter(Boolean);
    if (d.statYears)    document.getElementById("statYears").textContent   = d.statYears;
    if (d.statProjects) document.getElementById("statProjects").textContent= d.statProjects;
    if (d.statClients)  document.getElementById("statClients").textContent = d.statClients;
    if (d.aboutLead)    document.getElementById("aboutLead").textContent   = d.aboutLead;
    if (d.aboutBody)    document.getElementById("aboutBody").innerHTML     = d.aboutBody;
    if (d.aboutInfo) {
      try {
        const items = JSON.parse(d.aboutInfo);
        const g = document.getElementById("aboutInfoGrid");
        if (g && items.length) g.innerHTML = items.map(i =>
          `<div class="info-item"><span class="info-label">${i.label}</span><span class="info-val">${i.value}</span></div>`
        ).join("");
      } catch {}
    }
  } catch (e) { console.warn("settings:", e); }
}

/* ═══════════════════════════════════════════════
   10. SKILLS
═══════════════════════════════════════════════ */
async function loadSkills() {
  const grid = document.getElementById("skillsGrid");
  if (!grid) return;
  try {
    const rows = await getAll(TABLES.skills, "sort_order", true);
    if (!rows.length) { grid.innerHTML = `<div class="empty-state"><i class="fas fa-code"></i><p>No skills added yet.</p></div>`; return; }
    const grouped = {};
    rows.forEach(s => { const c = s.category||"General"; (grouped[c]=grouped[c]||[]).push(s); });
    let html = "";
    Object.entries(grouped).forEach(([cat, items]) => {
      html += `<div class="skill-group-title">${cat}</div>`;
      items.forEach(s => {
        html += `<div class="skill-card reveal-up">
          <div class="skill-header">
            <div class="skill-icon"><i class="${s.icon||'fas fa-code'}"></i></div>
            <div><div class="skill-name">${s.name}</div><div class="skill-category">${s.category||""}</div></div>
          </div>
          <div class="skill-bar-wrap"><div class="skill-bar" data-level="${s.level||80}" style="width:0%"></div></div>
          <div class="skill-level">${s.level||80}%</div>
        </div>`;
      });
    });
    grid.innerHTML = html;
    initReveal();
    setTimeout(() => grid.querySelectorAll(".skill-bar").forEach(b => b.style.width = b.dataset.level + "%"), 400);
  } catch (e) {
    grid.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load skills.</p></div>`;
  }
}

/* ═══════════════════════════════════════════════
   11. PROJECTS
═══════════════════════════════════════════════ */
let _allProjects = [];
async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  const filterBar = document.getElementById("projectsFilter");
  if (!grid) return;
  try {
    _allProjects = await getAll(TABLES.projects, "sort_order", true);
    if (!_allProjects.length) { grid.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet.</p></div>`; return; }
    const cats = ["All", ...new Set(_allProjects.map(p=>p.category).filter(Boolean))];
    if (filterBar) {
      filterBar.innerHTML = cats.map(c =>
        `<button class="filter-btn${c==="All"?" active":""}" data-filter="${c}">${c}</button>`
      ).join("");
      filterBar.querySelectorAll(".filter-btn").forEach(b =>
        b.addEventListener("click", () => {
          filterBar.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));
          b.classList.add("active");
          renderProjects(b.dataset.filter);
        })
      );
    }
    renderProjects("All");
  } catch { grid.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load.</p></div>`; }
}
function renderProjects(filter) {
  const grid = document.getElementById("projectsGrid");
  const list = filter === "All" ? _allProjects : _allProjects.filter(p => p.category === filter);
  if (!list.length) { grid.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects here.</p></div>`; return; }
  grid.innerHTML = list.map(p => `
    <div class="project-card reveal-up">
      <div class="project-img">
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-folder-open\\'></i>'" />` : `<i class="fas fa-folder-open"></i>`}
      </div>
      <div class="project-body">
        ${p.category?`<div class="project-category">${p.category}</div>`:""}
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description||""}</p>
        <div class="project-techs">${(p.technologies||"").split(",").map(t=>t.trim()).filter(Boolean).map(t=>`<span class="tech-tag">${t}</span>`).join("")}</div>
        <div class="project-links">
          ${p.github_url?`<a href="${p.github_url}" target="_blank" rel="noopener" class="project-link"><i class="fab fa-github"></i> GitHub</a>`:""}
          ${p.demo_url?`<a href="${p.demo_url}" target="_blank" rel="noopener" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>`:""}
        </div>
      </div>
    </div>`).join("");
  initReveal();
}

/* ═══════════════════════════════════════════════
   12. EXPERIENCE
═══════════════════════════════════════════════ */
async function loadExperience() {
  const tl = document.getElementById("experienceTimeline");
  if (!tl) return;
  try {
    const rows = await getAll(TABLES.experience, "sort_order", true);
    if (!rows.length) { tl.innerHTML = `<div class="empty-state"><i class="fas fa-briefcase"></i><p>No experience yet.</p></div>`; return; }
    tl.innerHTML = rows.map((e,i) => `
      <div class="timeline-item reveal-up" style="animation-delay:${i*.1}s">
        <div class="timeline-card">
          <div class="timeline-header">
            <div class="timeline-role">${e.role}</div>
            <span class="timeline-duration">${e.duration}</span>
          </div>
          <div class="timeline-company"><i class="fas fa-building"></i>&nbsp;<span>${e.company}</span>${e.location?` &bull; ${e.location}`:""}</div>
          <ul class="timeline-responsibilities">
            ${(e.responsibilities||"").split("\n").filter(Boolean).map(r=>`<li>${r}</li>`).join("")}
          </ul>
        </div>
      </div>`).join("");
    initReveal();
  } catch { tl.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load.</p></div>`; }
}

/* ═══════════════════════════════════════════════
   13. NOTES / TOPICS
═══════════════════════════════════════════════ */
let _currentUser = null;
onAuthStateChange(u => { _currentUser = u; loadTopics(); });

async function loadTopics() {
  const sb = document.getElementById("topicsSidebar");
  if (!sb) return;
  try {
    const topics = await getAll(TABLES.topics, "sort_order", true);
    if (!topics.length) { sb.innerHTML = `<div style="padding:1rem;color:var(--text-muted);font-size:.85rem">No topics yet.</div>`; return; }
    sb.innerHTML = topics.map((t,i) => `
      <button class="topic-btn${i===0?" active":""}" data-id="${t.id}" data-name="${t.name}">
        <i class="${t.icon||'fas fa-book'}"></i><span>${t.name}</span>
      </button>`).join("");
    sb.querySelectorAll(".topic-btn").forEach(b => {
      b.addEventListener("click", () => {
        sb.querySelectorAll(".topic-btn").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        loadNotesForTopic(b.dataset.id, b.dataset.name);
      });
    });
    if (topics.length) loadNotesForTopic(topics[0].id, topics[0].name);
  } catch { sb.innerHTML = `<div style="padding:1rem;color:var(--danger);font-size:.85rem">Failed to load topics.</div>`; }
}

async function loadNotesForTopic(topicId, topicName) {
  const nc = document.getElementById("notesContent");
  if (!nc) return;
  nc.innerHTML = `<div class="spinner"></div>`;
  try {
    const notes = await getNotesByTopic(topicId);
    if (!notes.length) {
      nc.innerHTML = `<div class="notes-placeholder"><i class="fas fa-sticky-note"></i><p>No notes in <strong>${topicName}</strong> yet.</p></div>`;
      return;
    }
    if (_currentUser?.email === ADMIN_EMAIL) {
      nc.innerHTML = `<h4 style="font-family:var(--font-display);font-weight:700;margin-bottom:1.25rem">${topicName}</h4>` +
        notes.map(n => `<div class="note-item"><div class="note-item-title">${n.title}</div><div class="note-item-content">${n.content}</div></div>`).join("");
    } else {
      nc.innerHTML = `<h4 style="font-family:var(--font-display);font-weight:700;margin-bottom:1.25rem">${topicName}</h4>
        <div class="notes-locked"><i class="fas fa-lock"></i><span>Notes are visible to admin only. ${notes.length} note(s) in this topic.</span></div>`;
    }
  } catch { nc.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load notes.</p></div>`; }
}

/* ═══════════════════════════════════════════════
   14. SOCIAL LINKS
═══════════════════════════════════════════════ */
async function loadSocial() {
  try {
    const links = await getAll(TABLES.social, "sort_order", true);
    const html = links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="social-link" title="${l.name}"><i class="${l.icon||'fas fa-link'}"></i></a>`).join("");
    const a = document.getElementById("socialLinksContact");
    const b = document.getElementById("footerSocial");
    if (a) a.innerHTML = html;
    if (b) b.innerHTML = html;
  } catch {}
}

/* ═══════════════════════════════════════════════
   15. RESUME
═══════════════════════════════════════════════ */
let _resumeData = null;
async function loadResume() {
  try {
    const row = await getOne(TABLES.resume, "main", "key");
    _resumeData = row?.value || null;
  } catch {}
}

document.getElementById("resumeDownloadBtn")?.addEventListener("click", () => {
  if (!_resumeData?.url) { showToast("No resume uploaded yet.", "warning"); return; }
  openModal("otpModal");
});

/* ═══════════════════════════════════════════════
   16. OTP
═══════════════════════════════════════════════ */
let _otp = null, _otpEmail = null, _otpExpiry = null;

document.getElementById("sendOtpBtn")?.addEventListener("click",   sendOtp);
document.getElementById("resendOtpBtn")?.addEventListener("click", sendOtp);
document.getElementById("verifyOtpBtn")?.addEventListener("click", verifyOtp);
document.getElementById("otpModalClose")?.addEventListener("click", () => closeModal("otpModal"));

async function sendOtp() {
  const email  = document.getElementById("otpEmail")?.value.trim();
  const status = document.getElementById("otpStep1Status");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus(status,"Enter a valid email.","error"); return; }
  const btn = document.getElementById("sendOtpBtn");
  setBtnLoading(btn, true, "Sending…");
  setStatus(status,"","");
  _otp       = Math.floor(100000 + Math.random() * 900000).toString();
  _otpEmail  = email;
  _otpExpiry = Date.now() + 5 * 60 * 1000;
  try {
    // Store OTP in Supabase for audit
    await _supa.from(TABLES.otp_store).insert({ email, otp: _otp, expires_at: new Date(_otpExpiry).toISOString(), used: false });
  } catch {}
  try {
    await emailjs.send(EJS.serviceId, EJS.otpTemplate, { to_email: email, otp_code: _otp, valid_for: "5 minutes" });
    document.getElementById("otpStep1").classList.add("hidden");
    document.getElementById("otpStep2").classList.remove("hidden");
    document.getElementById("otpEmailDisplay").textContent = email;
    document.querySelector(".otp-digit")?.focus();
    showToast("OTP sent! Check your inbox.", "success");
  } catch {
    // Dev fallback
    showToast(`[DEV] OTP: ${_otp}`, "warning", 15000);
    document.getElementById("otpStep1").classList.add("hidden");
    document.getElementById("otpStep2").classList.remove("hidden");
    document.getElementById("otpEmailDisplay").textContent = email;
  }
  setBtnLoading(btn, false, "Send OTP");
}

// OTP digit navigation
document.querySelectorAll(".otp-digit").forEach((inp, i, arr) => {
  inp.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/,"");
    if (e.target.value && i < arr.length-1) arr[i+1].focus();
  });
  inp.addEventListener("keydown", e => {
    if (e.key==="Backspace" && !e.target.value && i>0) arr[i-1].focus();
  });
});

async function verifyOtp() {
  const digits  = [...document.querySelectorAll(".otp-digit")].map(i=>i.value).join("");
  const status  = document.getElementById("otpStep2Status");
  const btn     = document.getElementById("verifyOtpBtn");
  if (digits.length !== 6) { setStatus(status,"Enter all 6 digits.","error"); return; }
  if (!_otp)               { setStatus(status,"Session expired. Request new OTP.","error"); return; }
  if (Date.now() > _otpExpiry) { setStatus(status,"OTP expired. Resend.","error"); return; }
  if (digits !== _otp)         { setStatus(status,"Incorrect OTP. Try again.","error"); return; }
  setBtnLoading(btn, true, "Verifying…");
  // Notify admin
  try {
    await emailjs.send(EJS.serviceId, EJS.notifyTemplate, {
      user_email:  _otpEmail,
      accessed_at: new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}),
      admin_email: ADMIN_EMAIL
    });
  } catch {}
  // Mark OTP used
  try { await _supa.from(TABLES.otp_store).update({used:true}).eq("otp",_otp).eq("email",_otpEmail); } catch {}
  // Download
  const a = document.createElement("a");
  a.href=_resumeData.url; a.download=_resumeData.filename||"resume.pdf"; a.target="_blank"; a.rel="noopener";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setBtnLoading(btn, false, "Verify & Download");
  closeModal("otpModal");
  showToast("Resume download started!", "success");
  _otp = null;
  document.getElementById("otpStep1").classList.remove("hidden");
  document.getElementById("otpStep2").classList.add("hidden");
  document.querySelectorAll(".otp-digit").forEach(i=>i.value="");
  document.getElementById("otpEmail").value="";
}

/* ═══════════════════════════════════════════════
   17. CONTACT FORM
═══════════════════════════════════════════════ */
document.getElementById("contactForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const btn    = document.getElementById("contactSubmitBtn");
  const status = document.getElementById("contactStatus");
  const name    = document.getElementById("contactName").value.trim();
  const email   = document.getElementById("contactEmail").value.trim();
  const subject = document.getElementById("contactSubject").value.trim();
  const message = document.getElementById("contactMessage").value.trim();
  if (!name||!email||!subject||!message) { setStatus(status,"Fill in all fields.","error"); return; }
  setBtnLoading(btn, true, "Sending…");
  setStatus(status,"","");
  try {
    await emailjs.send(EJS.serviceId, EJS.contactTemplate, { from_name:name, from_email:email, subject, message, to_email:ADMIN_EMAIL });
    setStatus(status,"Message sent! I'll get back to you soon.","success");
    e.target.reset();
    showToast("Message sent!", "success");
  } catch {
    setStatus(status,"Failed to send. Please email directly.","error");
  }
  setBtnLoading(btn, false, "Send Message");
});

/* ═══════════════════════════════════════════════
   18. ADMIN LOGIN MODAL
═══════════════════════════════════════════════ */
document.getElementById("navAdminBtn")?.addEventListener("click", async () => {
  const user = await getCurrentUser();
  if (user) { window.location.href = "admin/index.html"; }
  else      { openModal("adminLoginModal"); }
});
document.getElementById("adminLoginClose")?.addEventListener("click", () => closeModal("adminLoginModal"));
document.getElementById("toggleAdminPw")?.addEventListener("click", function() {
  const pw = document.getElementById("adminPassword");
  pw.type = pw.type==="password" ? "text" : "password";
  this.querySelector("i").className = pw.type==="password" ? "fas fa-eye" : "fas fa-eye-slash";
});
document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
  const email  = document.getElementById("adminEmail").value.trim();
  const pass   = document.getElementById("adminPassword").value;
  const status = document.getElementById("adminLoginStatus");
  const btn    = document.getElementById("adminLoginBtn");
  if (!email||!pass) { setStatus(status,"Enter email and password.","error"); return; }
  setBtnLoading(btn, true, "Signing in…");
  setStatus(status,"","");
  try {
    await signIn(email, pass);
    closeModal("adminLoginModal");
    showToast("Welcome, Admin!", "success");
    setTimeout(() => window.location.href = "admin/index.html", 600);
  } catch (err) {
    setStatus(status, err.message?.includes("Invalid") ? "Invalid credentials." : "Sign-in failed.", "error");
    setBtnLoading(btn, false, "Sign In");
  }
});

/* ═══════════════════════════════════════════════
   19. FOOTER YEAR
═══════════════════════════════════════════════ */
const fyEl = document.getElementById("footerYear");
if (fyEl) fyEl.textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════════
   20. BOOT
═══════════════════════════════════════════════ */
(async function boot() {
  await loadSettings();
  loadSkills();
  loadProjects();
  loadExperience();
  loadSocial();
  loadResume();
  // Topics loaded after auth state resolves via onAuthStateChange
})();
