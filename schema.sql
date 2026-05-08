-- ============================================================
-- RIZWAN SHAIKH PORTFOLIO — SUPABASE SQL SCHEMA
-- ============================================================
-- HOW TO USE:
--   1. Go to supabase.com → your project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. All tables, policies, and storage bucket will be created
-- ============================================================


-- ── EXTENSIONS ───────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ── 1. SETTINGS TABLE ────────────────────────────────────
-- Stores hero section, about section as a single JSON row
create table if not exists settings (
  id          bigint generated always as identity primary key,
  key         text unique not null,          -- e.g. 'site'
  value       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- ── 2. SKILLS TABLE ──────────────────────────────────────
create table if not exists skills (
  id          bigint generated always as identity primary key,
  name        text not null,
  category    text,
  level       int  default 80 check (level >= 0 and level <= 100),
  icon        text default 'fas fa-code',
  sort_order  int  default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 3. PROJECTS TABLE ────────────────────────────────────
create table if not exists projects (
  id           bigint generated always as identity primary key,
  title        text not null,
  description  text,
  technologies text,
  github_url   text,
  demo_url     text,
  image_url    text,
  category     text,
  sort_order   int  default 1,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 4. EXPERIENCE TABLE ──────────────────────────────────
create table if not exists experience (
  id               bigint generated always as identity primary key,
  company          text not null,
  role             text not null,
  duration         text,
  location         text,
  responsibilities text,
  sort_order       int  default 1,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── 5. TOPICS TABLE ──────────────────────────────────────
create table if not exists topics (
  id          bigint generated always as identity primary key,
  name        text not null,
  icon        text default 'fas fa-book',
  sort_order  int  default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 6. NOTES TABLE ───────────────────────────────────────
-- Each note belongs to a topic (foreign key)
create table if not exists notes (
  id          bigint generated always as identity primary key,
  topic_id    bigint not null references topics(id) on delete cascade,
  title       text not null,
  content     text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 7. SOCIAL LINKS TABLE ────────────────────────────────
create table if not exists social (
  id          bigint generated always as identity primary key,
  name        text not null,
  url         text not null,
  icon        text default 'fas fa-link',
  sort_order  int  default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 8. RESUME TABLE ──────────────────────────────────────
-- Stores a single row with the resume PDF public URL
create table if not exists resume (
  id          bigint generated always as identity primary key,
  key         text unique not null default 'main',
  value       jsonb not null default '{}',   -- { url, filename, uploadedAt }
  updated_at  timestamptz default now()
);

-- ── 9. OTP STORE TABLE ───────────────────────────────────
-- Temporary storage for email OTPs (auto-cleaned)
create table if not exists otp_store (
  id          bigint generated always as identity primary key,
  email       text not null,
  otp         text not null,
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

-- Auto-delete expired OTPs after 1 hour (keep table clean)
create or replace function delete_old_otps()
returns trigger language plpgsql as $$
begin
  delete from otp_store where expires_at < now() - interval '1 hour';
  return new;
end;
$$;

drop trigger if exists cleanup_otps on otp_store;
create trigger cleanup_otps
  after insert on otp_store
  execute procedure delete_old_otps();


-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Public can READ most tables; only admin can WRITE
-- Admin is identified by email: rizwan.shaikh3699@gmail.com
-- ============================================================

-- Enable RLS on all tables
alter table settings   enable row level security;
alter table skills     enable row level security;
alter table projects   enable row level security;
alter table experience enable row level security;
alter table topics     enable row level security;
alter table notes      enable row level security;
alter table social     enable row level security;
alter table resume     enable row level security;
alter table otp_store  enable row level security;


-- ── SETTINGS ─────────────────────────────────────────────
create policy "Public read settings"
  on settings for select using (true);

create policy "Admin write settings"
  on settings for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── SKILLS ───────────────────────────────────────────────
create policy "Public read skills"
  on skills for select using (true);

create policy "Admin write skills"
  on skills for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── PROJECTS ─────────────────────────────────────────────
create policy "Public read projects"
  on projects for select using (true);

create policy "Admin write projects"
  on projects for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── EXPERIENCE ───────────────────────────────────────────
create policy "Public read experience"
  on experience for select using (true);

create policy "Admin write experience"
  on experience for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── TOPICS ───────────────────────────────────────────────
create policy "Public read topics"
  on topics for select using (true);

create policy "Admin write topics"
  on topics for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── NOTES (admin only — private knowledge base) ──────────
create policy "Admin only read notes"
  on notes for select
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');

create policy "Admin write notes"
  on notes for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── SOCIAL ───────────────────────────────────────────────
create policy "Public read social"
  on social for select using (true);

create policy "Admin write social"
  on social for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── RESUME ───────────────────────────────────────────────
create policy "Public read resume"
  on resume for select using (true);

create policy "Admin write resume"
  on resume for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ── OTP STORE ────────────────────────────────────────────
create policy "Anyone can insert OTP"
  on otp_store for insert with check (true);

create policy "Admin read/update OTP"
  on otp_store for all
  using (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com');


-- ============================================================
-- STORAGE BUCKET for Resume PDF
-- ============================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Anyone can read/download resume
create policy "Public read resumes"
  on storage.objects for select
  using (bucket_id = 'resumes');

-- Only admin can upload/delete
create policy "Admin upload resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com'
  );

create policy "Admin delete resume"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.jwt() ->> 'email' = 'rizwan.shaikh3699@gmail.com'
  );


-- ============================================================
-- SEED DATA — default site settings (optional starter data)
-- ============================================================
insert into settings (key, value) values (
  'site',
  '{
    "heroName":     "Rizwan Shaikh",
    "heroRoles":    "Power Apps, Power Automate, Power BI, SharePoint Solutions, Azure Integrations",
    "heroDesc":     "Power Platform Developer crafting enterprise-grade solutions with Microsoft''s low-code ecosystem. Transforming complex business processes into elegant digital workflows.",
    "statYears":    "3+",
    "statProjects": "20+",
    "statClients":  "15+",
    "aboutLead":    "A passionate Power Platform Developer with 3+ years of hands-on experience building enterprise solutions that drive real business impact.",
    "aboutBody":    "<p>I specialize in the Microsoft Power Platform ecosystem — designing intuitive Power Apps, automating complex workflows with Power Automate, and delivering insightful dashboards in Power BI.</p><p>Beyond the low-code space, I am well-versed in SharePoint development, Azure integration, and Microsoft 365 administration.</p>",
    "aboutInfo":    "[{\"label\":\"Location\",\"value\":\"India\"},{\"label\":\"Experience\",\"value\":\"3+ Years\"},{\"label\":\"Specialization\",\"value\":\"Power Platform\"},{\"label\":\"Email\",\"value\":\"rizwan.shaikh3699@gmail.com\"}]"
  }'
) on conflict (key) do nothing;


-- Seed sample skills
insert into skills (name, category, level, icon, sort_order) values
  ('Power Apps',      'Power Platform', 95, 'fas fa-bolt',        1),
  ('Power Automate',  'Power Platform', 90, 'fas fa-robot',       2),
  ('Power BI',        'Power Platform', 88, 'fas fa-chart-bar',   3),
  ('Power Pages',     'Power Platform', 75, 'fas fa-globe',       4),
  ('SharePoint',      'Microsoft 365',  85, 'fas fa-share-alt',   5),
  ('Microsoft Teams', 'Microsoft 365',  80, 'fab fa-microsoft',   6),
  ('Azure',           'Cloud',          70, 'fas fa-cloud',       7),
  ('Dataverse',       'Data',           82, 'fas fa-database',    8),
  ('SQL',             'Data',           75, 'fas fa-table',       9),
  ('JavaScript',      'Development',    65, 'fab fa-js',         10)
on conflict do nothing;


-- Seed sample social links
insert into social (name, url, icon, sort_order) values
  ('LinkedIn', 'https://linkedin.com/in/rizwan-shaikh', 'fab fa-linkedin', 1),
  ('GitHub',   'https://github.com/rizwan-shaikh',      'fab fa-github',   2),
  ('Email',    'mailto:rizwan.shaikh3699@gmail.com',     'fas fa-envelope', 3)
on conflict do nothing;


-- ============================================================
-- DONE! All tables, RLS policies, and storage bucket created.
-- ============================================================
