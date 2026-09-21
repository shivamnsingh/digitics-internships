# Deploying Digitics Without Docker

Supabase now stores applications and uploaded files, so the app can run on a free Node hosting provider such as Vercel. Create a Supabase project first, then run `supabase/schema.sql` in the Supabase SQL Editor. Create a private Storage bucket named `application-files`.

Set these environment variables in the hosting provider:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_STORAGE_BUCKET=application-files
ADMIN_PASSWORD=your-private-admin-password
ADMIN_SESSION_SECRET=your-random-session-secret
```

Deploy the repository as a Next.js project with build command `npm run build` and start command `npm start`. Do not expose `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_` variable. Give the owner `https://your-domain.example/admin`; the dashboard lists submissions, uploaded files, status, notes, and CSV export.

Verify `GET /api/health` returns `{"ok":true}` after deployment. Supabase is now the source of truth, so no Docker volume or local database backup is required, but enable Supabase backups where available.

## Free Google Sheets sync

1. Create a blank Google Sheet for applications. Give the owner/boss access to view or edit it.
2. Open **Extensions > Apps Script**, replace the editor contents with `google-apps-script/Code.gs`, and save.
3. In Apps Script, open **Project Settings > Script properties** and add:
   - `SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the Google Sheet URL.
   - `SHEET_NAME`: `Applications`.
   - `WEBHOOK_SECRET`: a long random secret.
4. Select **Deploy > New deployment > Web app**, choose **Execute as me**, allow **Anyone**, and copy the web app URL.
5. Put these values in the server's `.env.local`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/your-deployment-id/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=the-same-secret-used-in-Apps-Script
```

6. Redeploy the app. New applications will appear as rows in Google Sheets automatically. The first column is the Application ID, and duplicate retries are ignored.
