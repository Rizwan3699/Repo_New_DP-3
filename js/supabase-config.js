/**
 * supabase-config.js
 * ─────────────────────────────────────────────────────────
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
 * actual values from: supabase.com → Project → Settings → API
 * ─────────────────────────────────────────────────────────
 */

const SUPABASE_URL = "https://evkxwvkhhovebfsgxshl";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a3h3dmtoaG92ZWJmc2d4c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjA1MzQsImV4cCI6MjA5MzgzNjUzNH0.KMvEm-dtRAv84ZspmvF35GbBOJgE3BiLL9utUc2lVtU";

// Init Supabase client (loaded via CDN script tag)
const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── TABLE NAMES ─────────────────────────────────────── */
const TABLES = {
  skills:     "skills",
  projects:   "projects",
  experience: "experience",
  topics:     "topics",
  notes:      "notes",
  social:     "social",
  resume:     "resume",
  settings:   "settings",
  otp_store:  "otp_store"
};

const ADMIN_EMAIL = "rizwan.shaikh3699@gmail.com";

/* ─── AUTH HELPERS ────────────────────────────────────── */
async function getSession() {
  const { data } = await _supa.auth.getSession();
  return data?.session || null;
}

async function getCurrentUser() {
  const { data } = await _supa.auth.getUser();
  return data?.user || null;
}

async function signIn(email, password) {
  const { data, error } = await _supa.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  await _supa.auth.signOut();
}

function onAuthStateChange(callback) {
  _supa.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

/* ─── DATABASE HELPERS ────────────────────────────────── */

/** Get all rows from a table ordered by a column */
async function getAll(table, orderBy = "sort_order", dir = true) {
  try {
    const { data, error } = await _supa
      .from(table)
      .select("*")
      .order(orderBy, { ascending: dir });
    if (error) throw error;
    return data || [];
  } catch {
    // Fallback without ordering
    const { data } = await _supa.from(table).select("*");
    return data || [];
  }
}

/** Get a single row by id or a custom column */
async function getOne(table, value, column = "id") {
  const { data, error } = await _supa
    .from(table)
    .select("*")
    .eq(column, value)
    .single();
  if (error) return null;
  return data;
}

/** Insert a new row */
async function insertRow(table, payload) {
  const { data, error } = await _supa
    .from(table)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing row by id */
async function updateRow(table, id, payload) {
  const { data, error } = await _supa
    .from(table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Upsert (insert or update) using a unique column */
async function upsertRow(table, payload, onConflict = "id") {
  const { data, error } = await _supa
    .from(table)
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a row by id */
async function deleteRow(table, id) {
  const { error } = await _supa.from(table).delete().eq("id", id);
  if (error) throw error;
}

/** Get notes for a specific topic */
async function getNotesByTopic(topicId) {
  const { data, error } = await _supa
    .from(TABLES.notes)
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

/* ─── STORAGE HELPERS ─────────────────────────────────── */

/** Upload a file to Supabase Storage */
async function uploadFile(bucket, path, file) {
  const { data, error } = await _supa.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return data;
}

/** Get a public URL for a stored file */
function getPublicUrl(bucket, path) {
  const { data } = _supa.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

/** Delete a file from storage */
async function deleteFile(bucket, path) {
  const { error } = await _supa.storage.from(bucket).remove([path]);
  if (error) throw error;
}
