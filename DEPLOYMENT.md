# Deploying Rug Weaver Pro to Your Hostinger Domain

This app is a Vite + React SPA. You have two main options to go live with your Hostinger domain.

---

## Before You Start

1. **Build**  
   Run `npm run build`; the app uses Supabase for the backend.

2. **Production environment variables**  
   Your app needs these at **build time** (they get baked into the build):
   - `VITE_SUPABASE_URL` – your Supabase project URL  
   - `VITE_SUPABASE_PUBLISHABLE_KEY` – your Supabase anon/public key  

   Set them in your CI/hosting dashboard or in a `.env.production` file (do not commit real keys to git).

3. **Backend is 100% Supabase** (auth, database, storage, email via Edge Function). For design-submission emails, deploy the Supabase Edge Function: see **SUPABASE_BACKEND.md** and **EMAIL_SETUP.md**.

---

## Option A: Host on Hostinger (upload built files)

Good if you have Hostinger **shared hosting** and want to keep everything on your domain there.

### 1. Build the app

```bash
npm install
npm run build
```

The output is in the **`dist/`** folder.

### 2. Upload to Hostinger

- In Hostinger: **File Manager** (or FTP) → go to **`public_html`** (or the folder your domain points to).
- Upload **everything inside `dist/`** (not the `dist` folder itself):  
  `index.html`, `assets/`, `favicon.ico`, etc.

### 3. SPA routing (important)

So that routes like `/designer` or `/orders` work on refresh, the server must serve `index.html` for all paths. On Hostinger (Apache), add a file named **`.htaccess`** in the same folder as `index.html` with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 4. Domain

- In Hostinger: **Domains** → your domain → make sure it’s pointed to the same **public_html** (or the folder where you uploaded the files).  
- No extra DNS changes needed if the domain is already set to this hosting.

---

## Option B: Host on Vercel or Netlify, use Hostinger only for the domain

Often easier and better for SPAs (free SSL, CDN, automatic builds).

### 1. Push code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy on Vercel or Netlify

- **Vercel**: [vercel.com](https://vercel.com) → Import your GitHub repo → Framework: **Vite** → add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` → Deploy.  
- **Netlify**: [netlify.com](https://netlify.com) → Add new site from Git → Build command: `npm run build` → Publish directory: `dist` → add the same env vars → Deploy.

### 3. Point your Hostinger domain to Vercel/Netlify

- In **Hostinger**: **Domains** → your domain → **DNS / Nameservers** (or **Manage DNS**).
- Add (or edit) records as your host instructs, for example:
  - **Vercel**: Add an **A** record pointing to Vercel’s IP, or a **CNAME** for `www` to `cname.vercel-dns.com`. Vercel dashboard → Your project → Settings → Domains will show the exact values.
  - **Netlify**: Add **A** and/or **CNAME** as shown in Netlify → Domain settings → “Custom domain”.

After DNS propagates (up to 24–48 hours, often sooner), your Hostinger domain will open the app hosted on Vercel/Netlify.

---

## Option C: Docker Deployment

Best for VPS or dedicated servers with Docker installed.

### 1. Prepare
Ensure you have `Dockerfile`, `docker-compose.yml`, and `nginx.conf` in your root directory.

### 2. Build and Run
```bash
docker compose up --build -d
```
The app will be served on port **3000** by default (mappable in `docker-compose.yml`).

---

## Checklist

- [ ] Build runs: `npm run build`
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set for production
- [ ] Either: files from `dist/` uploaded to Hostinger + `.htaccess` for SPA, **or** site deployed on Vercel/Netlify, **or** Docker container running.
- [ ] Domain in Hostinger points to the right place (same hosting or DNS to Vercel/Netlify/VPS)
- [ ] Container status (if using Docker): `docker ps` shows the app as "Up"
- [ ] Port mapping: Port 3000 (host) -> 80 (container) is correctly configured.
- [ ] Test all main routes and Supabase auth (login/signup) on the live URL
