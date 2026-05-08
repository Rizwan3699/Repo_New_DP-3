/**
 * admin.js  –  Admin Dashboard (Supabase)
 * Requires supabase-config.js loaded first
 */

/* ═══════════════════════════════════════════════
   1. AUTH GUARD
═══════════════════════════════════════════════ */
(async function authGuard() {
  const user = await getCurrentUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    window.location.href = "../index.html";
    return;
  }
  document.getElementById("authGuard")?.classList.add("hidden");
  bootAdmin();
})();

/* ═══════════════════════════════════════════════
   2. THEME
═══════════════════════════════════════════════ */
const saved = localStorage.getItem("rs-theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);
updateAdminIcon(saved);

document.getElementById("adminThemeToggle")?.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("rs-theme", next);
  updateAdminIcon(next);
});
function updateAdminIcon(t) {
  const ic = document.getElementById("adminThemeIcon");
  if (ic) ic.className = t === "dark" ? "fas fa-moon" : "fas fa-sun";
}

/* ═══════════════════════════════════════════════
   3. SIDEBAR NAV
═══════════════════════════════════════════════ */
const sidebarEl = document.getElementById("adminSidebar");
const panelTabs = document.querySelectorAll(".sidebar-item[data-panel]");

panelTabs.forEach(item => {
  item.addEventListener("click", () => {
    panelTabs.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`panel-${item.dataset.panel}`)?.classList.add("active");
    document.getElementById("topbarTitle").textContent = item.querySelector("span")?.textContent || "Dashboard";
    if (window.innerWidth < 1024) sidebarEl.classList.remove("open");
  });
});

document.getElementById("sidebarToggle")?.addEventListener("click", () =>
  sidebarEl.classList.toggle("open")
);

if (window.innerWidth < 1024) sidebarEl.classList.add("collapsed");
sidebarEl.classList.remove("collapsed");

/* ═══════════════════════════════════════════════
   4. LOGOUT
═══════════════════════════════════════════════ */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut();
  window.location.href = "../index.html";
});

/* ═══════════════════════════════════════════════
   5. TOAST
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
   6. CONFIRM MODAL
═══════════════════════════════════════════════ */
let _confirmCb = null;
function confirmDelete(msg, cb) {
  document.getElementById("confirmMsg").textContent = msg;
  _confirmCb = cb;
  document.getElementById("confirmModal").classList.add("open");
}
document.getElementById("confirmYes")?.addEventListener("click", () => {
  _confirmCb?.();
  document.getElementById("confirmModal").classList.remove("open");
});
document.getElementById("confirmNo")?.addEventListener("click", () =>
  document.getElementById("confirmModal").classList.remove("open")
);

/* ═══════════════════════════════════════════════
   7. HELPERS
═══════════════════════════════════════════════ */
function showForm(id) { document.getElementById(id)?.classList.remove("hidden"); }
function hideForm(id) { document.getElementById(id)?.classList.add("hidden"); }
function emptyHtml(icon, text) { return `<div class="empty-state"><i class="fas ${icon}"></i><p>${text}</p></div>`; }
function setBtnLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  const sp = btn.querySelector("span") || btn;
  if (btn.querySelector("span")) btn.querySelector("span").textContent = label;
  else btn.textContent = label;
  btn.querySelector(".admin-spin")?.remove();
  if (loading) btn.insertAdjacentHTML("beforeend", `<i class="fas fa-spinner fa-spin admin-spin" style="margin-left:.5rem"></i>`);
}

/* ═══════════════════════════════════════════════
   8. DASHBOARD STATS
═══════════════════════════════════════════════ */
async function loadDashboardStats() {
  try {
    const [sk, pr, ex, tp] = await Promise.all([
      _supa.from(TABLES.skills).select("id",{count:"exact",head:true}),
      _supa.from(TABLES.projects).select("id",{count:"exact",head:true}),
      _supa.from(TABLES.experience).select("id",{count:"exact",head:true}),
      _supa.from(TABLES.topics).select("id",{count:"exact",head:true})
    ]);
    document.getElementById("dSkills").textContent     = sk.count    ?? "–";
    document.getElementById("dProjects").textContent   = pr.count    ?? "–";
    document.getElementById("dExperience").textContent = ex.count    ?? "–";
    document.getElementById("dTopics").textContent     = tp.count    ?? "–";
  } catch {}
}

/* ═══════════════════════════════════════════════
   9. SETTINGS (hero + about stored as JSON in settings table)
═══════════════════════════════════════════════ */
async function loadHeroAboutSettings() {
  try {
    const row = await getOne(TABLES.settings, "site", "key");
    if (!row?.value) return;
    const d = row.value;
    document.getElementById("heroNameInput").value    = d.heroName     || "";
    document.getElementById("heroRoleInput").value    = d.heroRoles    || "";
    document.getElementById("heroDescInput").value    = d.heroDesc     || "";
    document.getElementById("heroStatYears").value    = d.statYears    || "";
    document.getElementById("heroStatProjects").value = d.statProjects || "";
    document.getElementById("heroStatClients").value  = d.statClients  || "";
    document.getElementById("aboutLeadInput").value   = d.aboutLead    || "";
    document.getElementById("aboutBodyInput").value   = d.aboutBody    || "";
    document.getElementById("aboutInfoInput").value   = d.aboutInfo    || "";
  } catch {}
}

async function saveSettings(extra = {}) {
  const row = await getOne(TABLES.settings, "site", "key");
  const current = row?.value || {};
  const merged = { ...current, ...extra };
  await upsertRow(TABLES.settings, { key: "site", value: merged }, "key");
}

document.getElementById("saveHeroBtn")?.addEventListener("click", async () => {
  const btn = document.getElementById("saveHeroBtn");
  setBtnLoading(btn, true, "Saving…");
  try {
    await saveSettings({
      heroName:     document.getElementById("heroNameInput").value.trim(),
      heroRoles:    document.getElementById("heroRoleInput").value.trim(),
      heroDesc:     document.getElementById("heroDescInput").value.trim(),
      statYears:    document.getElementById("heroStatYears").value.trim(),
      statProjects: document.getElementById("heroStatProjects").value.trim(),
      statClients:  document.getElementById("heroStatClients").value.trim()
    });
    showToast("Hero section saved!", "success");
  } catch (e) { showToast("Failed: " + e.message, "error"); }
  setBtnLoading(btn, false, "Save Changes");
});

document.getElementById("saveAboutBtn")?.addEventListener("click", async () => {
  const btn = document.getElementById("saveAboutBtn");
  setBtnLoading(btn, true, "Saving…");
  try {
    await saveSettings({
      aboutLead: document.getElementById("aboutLeadInput").value.trim(),
      aboutBody: document.getElementById("aboutBodyInput").value.trim(),
      aboutInfo: document.getElementById("aboutInfoInput").value.trim()
    });
    showToast("About section saved!", "success");
  } catch (e) { showToast("Failed: " + e.message, "error"); }
  setBtnLoading(btn, false, "Save Changes");
});

/* ═══════════════════════════════════════════════
   10. SKILLS
═══════════════════════════════════════════════ */
async function loadSkillsList() {
  const list = document.getElementById("skillsList");
  if (!list) return;
  list.innerHTML = `<div class="spinner" style="margin:1rem auto"></div>`;
  try {
    const rows = await getAll(TABLES.skills, "sort_order", true);
    if (!rows.length) { list.innerHTML = emptyHtml("fa-code","No skills yet."); return; }
    list.innerHTML = rows.map(s => `
      <div class="admin-list-item">
        <div class="admin-list-item-icon"><i class="${s.icon||'fas fa-code'}"></i></div>
        <div class="admin-list-item-info">
          <div class="admin-list-item-title">${s.name}</div>
          <div class="admin-list-item-meta">${s.category||"–"}</div>
        </div>
        <span class="skill-level-badge">${s.level||0}%</span>
        <div class="admin-list-item-actions">
          <button class="icon-btn" onclick="editSkill(${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="delSkill(${s.id},'${escQ(s.name)}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join("");
  } catch { list.innerHTML = emptyHtml("fa-exclamation-triangle","Failed to load."); }
}

document.getElementById("addSkillBtn")?.addEventListener("click", () => {
  clearF(["skillRowId","skillName","skillCategory","skillIcon"]);
  document.getElementById("skillLevel").value = "";
  document.getElementById("skillOrder").value = "1";
  document.getElementById("skillFormTitle").textContent = "Add Skill";
  showForm("skillForm");
});
document.getElementById("cancelSkillBtn")?.addEventListener("click", () => hideForm("skillForm"));

document.getElementById("saveSkillBtn")?.addEventListener("click", async () => {
  const btn  = document.getElementById("saveSkillBtn");
  const id   = parseInt(document.getElementById("skillRowId").value) || null;
  const name = document.getElementById("skillName").value.trim();
  if (!name) { showToast("Name is required.", "error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = {
      name,
      category:   document.getElementById("skillCategory").value.trim(),
      level:      parseInt(document.getElementById("skillLevel").value) || 80,
      icon:       document.getElementById("skillIcon").value.trim() || "fas fa-code",
      sort_order: parseInt(document.getElementById("skillOrder").value) || 1
    };
    if (id) await updateRow(TABLES.skills, id, payload);
    else    await insertRow(TABLES.skills, payload);
    showToast("Skill saved!", "success");
    hideForm("skillForm");
    loadSkillsList();
    loadDashboardStats();
  } catch (e) { showToast("Failed: " + e.message, "error"); }
  setBtnLoading(btn, false, "Save Skill");
});

async function editSkill(id) {
  const row = await getOne(TABLES.skills, id);
  if (!row) return;
  document.getElementById("skillRowId").value   = row.id;
  document.getElementById("skillName").value    = row.name;
  document.getElementById("skillCategory").value= row.category||"";
  document.getElementById("skillLevel").value   = row.level||80;
  document.getElementById("skillIcon").value    = row.icon||"";
  document.getElementById("skillOrder").value   = row.sort_order||1;
  document.getElementById("skillFormTitle").textContent = "Edit Skill";
  showForm("skillForm");
}

function delSkill(id, name) {
  confirmDelete(`Delete skill "${name}"?`, async () => {
    try { await deleteRow(TABLES.skills, id); showToast("Deleted.","success"); loadSkillsList(); loadDashboardStats(); }
    catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

/* ═══════════════════════════════════════════════
   11. PROJECTS
═══════════════════════════════════════════════ */
async function loadProjectsList() {
  const list = document.getElementById("projectsList");
  if (!list) return;
  list.innerHTML = `<div class="spinner" style="margin:1rem auto"></div>`;
  try {
    const rows = await getAll(TABLES.projects, "sort_order", true);
    if (!rows.length) { list.innerHTML = emptyHtml("fa-folder-open","No projects yet."); return; }
    list.innerHTML = rows.map(p => `
      <div class="admin-list-item">
        <div class="admin-list-item-icon"><i class="fas fa-folder-open"></i></div>
        <div class="admin-list-item-info">
          <div class="admin-list-item-title">${p.title}</div>
          <div class="admin-list-item-meta">${p.category||"–"} &bull; ${(p.technologies||"").split(",").slice(0,2).join(", ")}</div>
        </div>
        <div class="admin-list-item-actions">
          <button class="icon-btn" onclick="editProject(${p.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="delProject(${p.id},'${escQ(p.title)}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join("");
  } catch { list.innerHTML = emptyHtml("fa-exclamation-triangle","Failed."); }
}

document.getElementById("addProjectBtn")?.addEventListener("click", () => {
  clearF(["projectRowId","projectTitle","projectDesc","projectTechs","projectGithub","projectDemo","projectImage","projectCategory"]);
  document.getElementById("projectOrder").value = "1";
  document.getElementById("projectFormTitle").textContent = "Add Project";
  showForm("projectForm");
});
document.getElementById("cancelProjectBtn")?.addEventListener("click", () => hideForm("projectForm"));

document.getElementById("saveProjectBtn")?.addEventListener("click", async () => {
  const btn   = document.getElementById("saveProjectBtn");
  const id    = parseInt(document.getElementById("projectRowId").value) || null;
  const title = document.getElementById("projectTitle").value.trim();
  if (!title) { showToast("Title is required.","error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = {
      title,
      description:  document.getElementById("projectDesc").value.trim(),
      technologies: document.getElementById("projectTechs").value.trim(),
      github_url:   document.getElementById("projectGithub").value.trim(),
      demo_url:     document.getElementById("projectDemo").value.trim(),
      image_url:    document.getElementById("projectImage").value.trim(),
      category:     document.getElementById("projectCategory").value.trim(),
      sort_order:   parseInt(document.getElementById("projectOrder").value)||1
    };
    if (id) await updateRow(TABLES.projects, id, payload);
    else    await insertRow(TABLES.projects, payload);
    showToast("Project saved!","success");
    hideForm("projectForm");
    loadProjectsList(); loadDashboardStats();
  } catch (e) { showToast("Failed: "+e.message,"error"); }
  setBtnLoading(btn, false, "Save Project");
});

async function editProject(id) {
  const p = await getOne(TABLES.projects, id);
  if (!p) return;
  document.getElementById("projectRowId").value    = p.id;
  document.getElementById("projectTitle").value    = p.title;
  document.getElementById("projectDesc").value     = p.description||"";
  document.getElementById("projectTechs").value    = p.technologies||"";
  document.getElementById("projectGithub").value   = p.github_url||"";
  document.getElementById("projectDemo").value     = p.demo_url||"";
  document.getElementById("projectImage").value    = p.image_url||"";
  document.getElementById("projectCategory").value = p.category||"";
  document.getElementById("projectOrder").value    = p.sort_order||1;
  document.getElementById("projectFormTitle").textContent = "Edit Project";
  showForm("projectForm");
}

function delProject(id, name) {
  confirmDelete(`Delete project "${name}"?`, async () => {
    try { await deleteRow(TABLES.projects,id); showToast("Deleted.","success"); loadProjectsList(); loadDashboardStats(); }
    catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

/* ═══════════════════════════════════════════════
   12. EXPERIENCE
═══════════════════════════════════════════════ */
async function loadExpList() {
  const list = document.getElementById("expList");
  if (!list) return;
  list.innerHTML = `<div class="spinner" style="margin:1rem auto"></div>`;
  try {
    const rows = await getAll(TABLES.experience, "sort_order", true);
    if (!rows.length) { list.innerHTML = emptyHtml("fa-briefcase","No experience yet."); return; }
    list.innerHTML = rows.map(e => `
      <div class="admin-list-item">
        <div class="admin-list-item-icon"><i class="fas fa-briefcase"></i></div>
        <div class="admin-list-item-info">
          <div class="admin-list-item-title">${e.role} @ ${e.company}</div>
          <div class="admin-list-item-meta">${e.duration||""}</div>
        </div>
        <div class="admin-list-item-actions">
          <button class="icon-btn" onclick="editExp(${e.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="delExp(${e.id},'${escQ(e.role+" @ "+e.company)}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join("");
  } catch { list.innerHTML = emptyHtml("fa-exclamation-triangle","Failed."); }
}

document.getElementById("addExpBtn")?.addEventListener("click", () => {
  clearF(["expRowId","expCompany","expRole","expDuration","expLocation","expResponsibilities"]);
  document.getElementById("expOrder").value = "1";
  document.getElementById("expFormTitle").textContent = "Add Experience";
  showForm("expForm");
});
document.getElementById("cancelExpBtn")?.addEventListener("click", () => hideForm("expForm"));

document.getElementById("saveExpBtn")?.addEventListener("click", async () => {
  const btn     = document.getElementById("saveExpBtn");
  const id      = parseInt(document.getElementById("expRowId").value) || null;
  const company = document.getElementById("expCompany").value.trim();
  const role    = document.getElementById("expRole").value.trim();
  if (!company||!role) { showToast("Company and role required.","error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = {
      company, role,
      duration:         document.getElementById("expDuration").value.trim(),
      location:         document.getElementById("expLocation").value.trim(),
      responsibilities: document.getElementById("expResponsibilities").value.trim(),
      sort_order:       parseInt(document.getElementById("expOrder").value)||1
    };
    if (id) await updateRow(TABLES.experience, id, payload);
    else    await insertRow(TABLES.experience, payload);
    showToast("Experience saved!","success");
    hideForm("expForm");
    loadExpList(); loadDashboardStats();
  } catch (e) { showToast("Failed: "+e.message,"error"); }
  setBtnLoading(btn, false, "Save Experience");
});

async function editExp(id) {
  const e = await getOne(TABLES.experience, id);
  if (!e) return;
  document.getElementById("expRowId").value            = e.id;
  document.getElementById("expCompany").value          = e.company;
  document.getElementById("expRole").value             = e.role;
  document.getElementById("expDuration").value         = e.duration||"";
  document.getElementById("expLocation").value         = e.location||"";
  document.getElementById("expResponsibilities").value = e.responsibilities||"";
  document.getElementById("expOrder").value            = e.sort_order||1;
  document.getElementById("expFormTitle").textContent  = "Edit Experience";
  showForm("expForm");
}

function delExp(id, label) {
  confirmDelete(`Delete "${label}"?`, async () => {
    try { await deleteRow(TABLES.experience,id); showToast("Deleted.","success"); loadExpList(); loadDashboardStats(); }
    catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

/* ═══════════════════════════════════════════════
   13. TOPICS & NOTES
═══════════════════════════════════════════════ */
let _activeTopic = null;

async function loadTopicsAdmin() {
  const list = document.getElementById("topicsAdminList");
  if (!list) return;
  list.innerHTML = `<div class="spinner" style="margin:1rem auto"></div>`;
  try {
    const rows = await getAll(TABLES.topics, "sort_order", true);
    if (!rows.length) { list.innerHTML = `<p style="padding:1rem;color:var(--text-muted);font-size:.8rem">No topics yet.</p>`; return; }
    list.innerHTML = rows.map(t => `
      <button class="topic-admin-btn${_activeTopic?.id===t.id?" active":""}"
              onclick="selectTopic(${t.id},'${escQ(t.name)}','${escQ(t.icon||'fas fa-book')}')">
        <i class="${t.icon||'fas fa-book'}"></i>
        <span class="btn-label">${t.name}</span>
        <div class="topic-admin-actions">
          <button class="icon-btn" onclick="event.stopPropagation();editTopic(${t.id})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="event.stopPropagation();delTopic(${t.id},'${escQ(t.name)}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </button>`).join("");
    if (_activeTopic) loadNotesAdmin(_activeTopic.id, _activeTopic.name);
  } catch { list.innerHTML = `<p style="color:var(--danger);padding:1rem">Failed.</p>`; }
}

function selectTopic(id, name, icon) {
  _activeTopic = { id, name, icon };
  loadTopicsAdmin();
  loadNotesAdmin(id, name);
}

async function loadNotesAdmin(topicId, topicName) {
  const area = document.getElementById("notesAdminArea");
  if (!area) return;
  area.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;
  try {
    const notes = await getNotesByTopic(topicId);
    area.innerHTML = `
      <div class="notes-admin-header">
        <h4>${topicName}</h4>
        <button class="btn btn-primary btn-sm" onclick="openNoteForm(${topicId})">
          <i class="fas fa-plus"></i> Add Note
        </button>
      </div>
      ${notes.length ? notes.map(n=>`
        <div class="note-admin-item">
          <div class="note-admin-body">
            <div class="note-admin-title">${n.title}</div>
            <div class="note-admin-content">${n.content}</div>
          </div>
          <div class="note-admin-actions">
            <button class="icon-btn" onclick="editNote(${n.id},${topicId},'${escQ(topicName)}')" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="icon-btn danger" onclick="delNote(${n.id},'${escQ(n.title)}',${topicId},'${escQ(topicName)}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`).join("")
      : `<div class="empty-state"><i class="fas fa-sticky-note"></i><p>No notes yet.</p></div>`}`;
  } catch { area.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed.</p></div>`; }
}

// Topic Form
document.getElementById("addTopicBtn")?.addEventListener("click", () => {
  clearF(["topicRowId","topicName","topicIcon"]);
  document.getElementById("topicOrder").value = "1";
  document.getElementById("topicFormTitle").textContent = "Add Topic";
  showForm("topicForm");
});
document.getElementById("cancelTopicBtn")?.addEventListener("click", () => hideForm("topicForm"));

document.getElementById("saveTopicBtn")?.addEventListener("click", async () => {
  const btn  = document.getElementById("saveTopicBtn");
  const id   = parseInt(document.getElementById("topicRowId").value) || null;
  const name = document.getElementById("topicName").value.trim();
  if (!name) { showToast("Name required.","error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = {
      name,
      icon:       document.getElementById("topicIcon").value.trim()||"fas fa-book",
      sort_order: parseInt(document.getElementById("topicOrder").value)||1
    };
    if (id) await updateRow(TABLES.topics, id, payload);
    else    await insertRow(TABLES.topics, payload);
    showToast("Topic saved!","success");
    hideForm("topicForm");
    loadTopicsAdmin(); loadDashboardStats();
  } catch (e) { showToast("Failed: "+e.message,"error"); }
  setBtnLoading(btn, false, "Save Topic");
});

async function editTopic(id) {
  const t = await getOne(TABLES.topics, id);
  if (!t) return;
  document.getElementById("topicRowId").value = t.id;
  document.getElementById("topicName").value  = t.name;
  document.getElementById("topicIcon").value  = t.icon||"";
  document.getElementById("topicOrder").value = t.sort_order||1;
  document.getElementById("topicFormTitle").textContent = "Edit Topic";
  showForm("topicForm");
}

function delTopic(id, name) {
  confirmDelete(`Delete topic "${name}" and all its notes?`, async () => {
    try {
      // Delete notes first
      await _supa.from(TABLES.notes).delete().eq("topic_id", id);
      await deleteRow(TABLES.topics, id);
      if (_activeTopic?.id === id) {
        _activeTopic = null;
        document.getElementById("notesAdminArea").innerHTML = `<div class="notes-placeholder"><i class="fas fa-book"></i><p>Select a topic</p></div>`;
      }
      showToast("Topic deleted.","success");
      loadTopicsAdmin(); loadDashboardStats();
    } catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

// Note Form
function openNoteForm(topicId) {
  clearF(["noteRowId","noteTitle","noteContent"]);
  document.getElementById("noteTopicId").value = topicId;
  document.getElementById("noteFormTitle").textContent = "Add Note";
  showForm("noteForm");
}
document.getElementById("cancelNoteBtn")?.addEventListener("click", () => hideForm("noteForm"));

document.getElementById("saveNoteBtn")?.addEventListener("click", async () => {
  const btn     = document.getElementById("saveNoteBtn");
  const id      = parseInt(document.getElementById("noteRowId").value) || null;
  const topicId = parseInt(document.getElementById("noteTopicId").value);
  const title   = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  if (!title||!content) { showToast("Title and content required.","error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = { title, content, topic_id: topicId };
    if (id) await updateRow(TABLES.notes, id, payload);
    else    await insertRow(TABLES.notes, payload);
    showToast("Note saved!","success");
    hideForm("noteForm");
    if (_activeTopic) loadNotesAdmin(_activeTopic.id, _activeTopic.name);
  } catch (e) { showToast("Failed: "+e.message,"error"); }
  setBtnLoading(btn, false, "Save Note");
});

async function editNote(noteId, topicId, topicName) {
  const n = await getOne(TABLES.notes, noteId);
  if (!n) return;
  document.getElementById("noteRowId").value   = n.id;
  document.getElementById("noteTopicId").value = topicId;
  document.getElementById("noteTitle").value   = n.title;
  document.getElementById("noteContent").value = n.content;
  document.getElementById("noteFormTitle").textContent = "Edit Note";
  showForm("noteForm");
}

function delNote(noteId, title, topicId, topicName) {
  confirmDelete(`Delete note "${title}"?`, async () => {
    try {
      await deleteRow(TABLES.notes, noteId);
      showToast("Note deleted.","success");
      loadNotesAdmin(topicId, topicName);
    } catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

/* ═══════════════════════════════════════════════
   14. RESUME — store URL in settings table
═══════════════════════════════════════════════ */
async function loadResumeAdmin() {
  try {
    const row = await getOne(TABLES.resume, "main", "key");
    const cur = document.getElementById("currentResume");
    const fn  = document.getElementById("currentResumeFilename");
    if (row?.value?.url) {
      cur.classList.remove("hidden");
      if (fn) fn.textContent = row.value.filename || "resume.pdf";
    } else {
      cur.classList.add("hidden");
    }
  } catch {}
}

document.getElementById("resumeSelectBtn")?.addEventListener("click", () =>
  document.getElementById("resumeFileInput")?.click()
);

const uploadArea = document.getElementById("resumeUploadArea");
uploadArea?.addEventListener("dragover",  e => { e.preventDefault(); uploadArea.classList.add("drag-over"); });
uploadArea?.addEventListener("dragleave", ()  => uploadArea.classList.remove("drag-over"));
uploadArea?.addEventListener("drop",      e  => { e.preventDefault(); uploadArea.classList.remove("drag-over"); const f=e.dataTransfer.files[0]; if(f) handleResume(f); });
uploadArea?.addEventListener("click",     ()  => document.getElementById("resumeFileInput")?.click());

document.getElementById("resumeFileInput")?.addEventListener("change", e => {
  const f = e.target.files[0]; if (f) handleResume(f);
});

async function handleResume(file) {
  const status = document.getElementById("resumeUploadStatus");
  if (file.type !== "application/pdf") { status.textContent="PDF only."; status.className="form-status error"; return; }
  if (file.size > 5*1024*1024) { status.textContent="Max 5 MB."; status.className="form-status error"; return; }
  status.textContent="Uploading…"; status.className="form-status info";

  // Progress bar
  if (!document.getElementById("resumeProgressBar")) {
    document.getElementById("resumeUploadArea").insertAdjacentHTML("afterend",
      `<div class="upload-progress"><div class="upload-progress-bar" id="resumeProgressBar"></div></div>`);
  }

  try {
    // Upload to Supabase Storage bucket "resumes"
    const path = `resume/${Date.now()}_${file.name}`;
    await uploadFile("resumes", path, file);
    const url = getPublicUrl("resumes", path);

    // Animate progress bar
    const bar = document.getElementById("resumeProgressBar");
    if (bar) bar.style.width = "100%";

    // Save URL in resume table
    await upsertRow(TABLES.resume, { key:"main", value:{ url, filename:file.name, uploadedAt:new Date().toISOString() } }, "key");

    status.textContent="Uploaded successfully!"; status.className="form-status success";
    showToast("Resume uploaded!","success");
    setTimeout(()=>document.getElementById("resumeProgressBar")?.parentElement?.remove(),1000);
    loadResumeAdmin();
  } catch (e) {
    status.textContent="Upload failed: "+e.message; status.className="form-status error";
  }
}

document.getElementById("deleteResumeBtn")?.addEventListener("click", () => {
  confirmDelete("Delete the current resume?", async () => {
    try {
      await _supa.from(TABLES.resume).delete().eq("key","main");
      showToast("Resume deleted.","success");
      loadResumeAdmin();
    } catch (e) { showToast("Failed: "+e.message,"error"); }
  });
});

/* ═══════════════════════════════════════════════
   15. SOCIAL LINKS
═══════════════════════════════════════════════ */
async function loadSocialList() {
  const list = document.getElementById("socialList");
  if (!list) return;
  list.innerHTML = `<div class="spinner" style="margin:1rem auto"></div>`;
  try {
    const rows = await getAll(TABLES.social, "sort_order", true);
    if (!rows.length) { list.innerHTML = emptyHtml("fa-share-alt","No social links yet."); return; }
    list.innerHTML = rows.map(l => `
      <div class="admin-list-item">
        <div class="admin-list-item-icon"><i class="${l.icon||'fas fa-link'}"></i></div>
        <div class="admin-list-item-info">
          <div class="admin-list-item-title">${l.name}</div>
          <div class="admin-list-item-meta">${l.url}</div>
        </div>
        <div class="admin-list-item-actions">
          <button class="icon-btn" onclick="editSocial(${l.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="delSocial(${l.id},'${escQ(l.name)}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join("");
  } catch { list.innerHTML = emptyHtml("fa-exclamation-triangle","Failed."); }
}

document.getElementById("addSocialBtn")?.addEventListener("click", () => {
  clearF(["socialRowId","socialName","socialIcon","socialUrl"]);
  document.getElementById("socialOrder").value = "1";
  document.getElementById("socialFormTitle").textContent = "Add Social Link";
  showForm("socialForm");
});
document.getElementById("cancelSocialBtn")?.addEventListener("click", () => hideForm("socialForm"));

document.getElementById("saveSocialBtn")?.addEventListener("click", async () => {
  const btn  = document.getElementById("saveSocialBtn");
  const id   = parseInt(document.getElementById("socialRowId").value) || null;
  const name = document.getElementById("socialName").value.trim();
  const url  = document.getElementById("socialUrl").value.trim();
  if (!name||!url) { showToast("Name and URL required.","error"); return; }
  setBtnLoading(btn, true, "Saving…");
  try {
    const payload = {
      name, url,
      icon:       document.getElementById("socialIcon").value.trim()||"fas fa-link",
      sort_order: parseInt(document.getElementById("socialOrder").value)||1
    };
    if (id) await updateRow(TABLES.social, id, payload);
    else    await insertRow(TABLES.social, payload);
    showToast("Social link saved!","success");
    hideForm("socialForm");
    loadSocialList();
  } catch (e) { showToast("Failed: "+e.message,"error"); }
  setBtnLoading(btn, false, "Save Link");
});

async function editSocial(id) {
  const l = await getOne(TABLES.social, id);
  if (!l) return;
  document.getElementById("socialRowId").value = l.id;
  document.getElementById("socialName").value  = l.name;
  document.getElementById("socialIcon").value  = l.icon||"";
  document.getElementById("socialUrl").value   = l.url;
  document.getElementById("socialOrder").value = l.sort_order||1;
  document.getElementById("socialFormTitle").textContent = "Edit Social Link";
  showForm("socialForm");
}

function delSocial(id, name) {
  confirmDelete(`Delete "${name}"?`, async () => {
    try { await deleteRow(TABLES.social,id); showToast("Deleted.","success"); loadSocialList(); }
    catch (e) { showToast("Failed: "+e.message,"error"); }
  });
}

/* ═══════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════ */
function clearF(ids) { ids.forEach(id => { const el=document.getElementById(id); if(el) el.value=""; }); }
function escQ(s)     { return String(s).replace(/'/g,"\\'"); }

/* ═══════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════ */
async function bootAdmin() {
  loadDashboardStats();
  loadHeroAboutSettings();
  loadSkillsList();
  loadProjectsList();
  loadExpList();
  loadTopicsAdmin();
  loadResumeAdmin();
  loadSocialList();
}
