# Rizwan Shaikh — Dynamic Portfolio CMS
### Powered by Supabase (PostgreSQL) + Vercel · 100% Free

---

## 📁 Project Structure

```
portfolio-supabase/
├── index.html                 ← Main portfolio page
├── vercel.json                ← Vercel deploy config
├── schema.sql                 ← Run once in Supabase SQL Editor
├── admin/
│   └── index.html             ← Admin dashboard
├── css/
│   ├── style.css              ← Full design system (dark/light)
│   └── admin.css              ← Admin-specific styles
└── js/
    ├── supabase-config.js     ← Supabase init + all DB helpers
    ├── script.js              ← Portfolio frontend logic
    └── admin.js               ← Admin dashboard logic
```

---

## ✅ What's Included

| Feature | Details |
|---|---|
| **Dynamic Content** | All sections editable from Admin Dashboard |
| **Database** | Supabase PostgreSQL (free 500 MB) |
| **Auth** | Supabase Auth (email + password) |
| **Storage** | Supabase Storage for resume PDF |
| **OTP Verification** | Email OTP before resume download |
| **Contact Form** | EmailJS (200 free emails/month) |
| **Admin Notification** | Email alert when resume is downloaded |
| **Dark / Light Mode** | Persisted in localStorage |
| **Fully Responsive** | Mobile, Tablet, Desktop |
| **Hosting** | Vercel (free) |

---

## 🚀 STEP-BY-STEP SETUP

---

### STEP 1 — Create Supabase Account & Project

1. Go to **[supabase.com](https://supabase.com)** → click **"Start your project"**
2. Sign up with GitHub or email (free)
3. Click **"New project"**
4. Fill in:
   - **Organization:** your name
   - **Project name:** `rizwan-portfolio`
   - **Database password:** create a strong password (save it!)
   - **Region:** select closest to India → `Southeast Asia (Singapore)`
5. Click **"Create new project"**
6. Wait 1–2 minutes for project to be ready

---

### STEP 2 — Run the SQL Schema

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file **`schema.sql`** from this project
4. Copy **all** the content
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: **"Success. No rows returned"**

This creates all 9 tables, all security rules, storage bucket, and seed data automatically.

---

### STEP 3 — Create Admin User in Supabase Auth

1. In Supabase left sidebar → click **"Authentication"**
2. Click **"Users"** tab
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - **Email:** `rizwan.shaikh3699@gmail.com`
   - **Password:** `Rizwan@123@`
5. Click **"Create user"**
6. The user appears in the list ✅

---

### STEP 4 — Get Your Supabase API Keys

1. In Supabase left sidebar → click **"Project Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You will see two important values:

```
Project URL:   https://xxxxxxxxxxx.supabase.co
anon public:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Copy both values.

---

### STEP 5 — Paste Keys into supabase-config.js

Open **`js/supabase-config.js`** and replace lines 8–9:

```js
// BEFORE:
const SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

// AFTER (example):
const SUPABASE_URL      = "https://abcdefghijklmn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...";
```

Save the file.

---

### STEP 6 — Set Up EmailJS (for OTP + Contact Form)

1. Go to **[emailjs.com](https://www.emailjs.com)** → Sign up free
2. Click **"Add New Service"** → choose **Gmail**
3. Connect your Gmail account → click **"Create Service"**
4. Note your **Service ID** (e.g. `service_abc1234`)

#### Create 3 Email Templates:

**Template 1 — OTP Email**
- Click **Email Templates** → **Create New Template**
- Name: `OTP Verification`
- Subject: `Your Resume Access OTP - Rizwan Portfolio`
- Body:
```
Hello,

Your one-time password to access Rizwan's resume is:

{{otp_code}}

This code is valid for {{valid_for}}.

Do not share this code with anyone.

- Rizwan Shaikh Portfolio
```
- Save → note **Template ID** (e.g. `template_otp111`)

---

**Template 2 — Admin Notification**
- Create New Template
- Name: `Resume Download Alert`
- To Email field: `{{admin_email}}`
- Subject: `🔔 Resume Downloaded - Portfolio Alert`
- Body:
```
Resume Download Notification

Someone downloaded your resume from your portfolio website.

User Email:  {{user_email}}
Date & Time: {{accessed_at}}

This is an automated notification.
```
- Save → note **Template ID** (e.g. `template_notify222`)

---

**Template 3 — Contact Form**
- Create New Template
- Name: `Portfolio Contact`
- To Email: `{{to_email}}`
- Subject: `Portfolio Contact: {{subject}}`
- Body:
```
New message from your portfolio contact form:

Name:    {{from_name}}
Email:   {{from_email}}
Subject: {{subject}}

Message:
{{message}}
```
- Save → note **Template ID** (e.g. `template_contact333`)

---

**Get Public Key:**
1. Click your account avatar (top right) → **"Account"**
2. Go to **"API Keys"** tab
3. Copy your **Public Key** (e.g. `user_AbCdEf123`)

---

**Paste all EmailJS keys into `js/script.js`:**

Find these lines near the top of `script.js` (lines 7–13):

```js
// BEFORE:
const EJS = {
  publicKey:      "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId:      "YOUR_EMAILJS_SERVICE_ID",
  otpTemplate:    "YOUR_OTP_TEMPLATE_ID",
  notifyTemplate: "YOUR_NOTIFY_TEMPLATE_ID",
  contactTemplate:"YOUR_CONTACT_TEMPLATE_ID"
};

// AFTER (example):
const EJS = {
  publicKey:      "user_AbCdEf123xyz",
  serviceId:      "service_abc1234",
  otpTemplate:    "template_otp111",
  notifyTemplate: "template_notify222",
  contactTemplate:"template_contact333"
};
```

Save the file.

---

### STEP 7 — Deploy to Vercel

#### Option A — Drag & Drop (Easiest)
1. Go to **[vercel.com](https://vercel.com)** → sign in with GitHub
2. Click **"Add New Project"**
3. Click **"Browse"** or drag your **`portfolio-supabase`** folder onto the page
4. Framework Preset → select **"Other"**
5. Root Directory → leave as `./`
6. Click **"Deploy"**
7. Wait ~1 minute → your live URL appears (e.g. `rizwan-portfolio.vercel.app`)

#### Option B — Via GitHub
1. Push your project to a GitHub repository
2. Go to vercel.com → New Project → Import from GitHub
3. Select your repo → Deploy

---

### STEP 8 — Add Vercel URL to Supabase Allowed URLs

1. Go to **Supabase → Authentication → URL Configuration**
2. Under **"Site URL"** → enter your Vercel URL:
   `https://rizwan-portfolio.vercel.app`
3. Under **"Redirect URLs"** → add:
   `https://rizwan-portfolio.vercel.app/**`
4. Click **Save**

---

### STEP 9 — Test Everything ✅

| Test | How |
|---|---|
| Portfolio loads | Open `your-url.vercel.app` |
| Skills show | Data from seed in schema.sql |
| Admin login | Click "Admin" button → email + password |
| Add a skill | Admin → Skills → Add Skill |
| Skill visible | Refresh portfolio → skills section |
| Resume OTP | Admin → Resume → upload PDF → portfolio download button |
| Contact form | Fill form → check your email |

---

## 🔑 Admin Credentials

| | |
|---|---|
| **Admin URL** | `your-site.vercel.app/admin` |
| **Email** | `rizwan.shaikh3699@gmail.com` |
| **Password** | `Rizwan@123@` |

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `settings` | Hero, About content (JSON) |
| `skills` | Skills with level & icon |
| `projects` | Project cards |
| `experience` | Work timeline |
| `topics` | Knowledge base categories |
| `notes` | Admin-only notes per topic |
| `social` | Footer & contact social links |
| `resume` | Resume PDF URL |
| `otp_store` | Temporary OTP records |

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost |
|---|---|---|
| Supabase | 500 MB DB, 1 GB Storage, 50K auth users | **$0** |
| Vercel | Unlimited static deploys | **$0** |
| EmailJS | 200 emails/month | **$0** |
| **Total** | | **$0/month** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Database | Supabase PostgreSQL |
| Auth | Supabase Authentication |
| Storage | Supabase Storage |
| Email | EmailJS |
| Hosting | Vercel |
| Fonts | Syne + DM Sans + JetBrains Mono |
| Icons | Font Awesome 6 |

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Admin redirects to homepage | Check user email matches `rizwan.shaikh3699@gmail.com` exactly in Supabase Auth |
| Data not loading | Open browser console → check for Supabase URL/key errors |
| RLS permission denied | Re-run `schema.sql` — the policies may not have applied |
| Resume upload fails | Check Supabase Storage → bucket `resumes` exists and is public |
| OTP not received | Verify EmailJS service ID + template ID in `script.js` |
| CORS error | Add your Vercel domain to Supabase → Auth → URL Configuration |

---

Built with ❤️ by **Rizwan Shaikh** — Power Platform Developer
