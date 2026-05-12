# NEXUS MANAGED SERVICES — Full Platform

## Stack
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS
- **Storage**: Cloudinary
- **Email**: SendGrid
- **PDF**: Puppeteer
- **Database**: Supabase (PostgreSQL)

---

## Folder Structure

```
nexus/
├── nexus-backend/     ← Node.js API server
└── nexus-frontend/    ← React web app
```

---

## STEP 1 — Accounts You Need (All Free)

Before running anything, create these accounts:

| Service | URL | What For |
|---------|-----|----------|
| Supabase | supabase.com | PostgreSQL database |
| Cloudinary | cloudinary.com | File/image storage |
| SendGrid | sendgrid.com | Sending emails |

---

## STEP 2 — Setup Backend

```bash
cd nexus-backend

# Install all dependencies
npm install

# Fill in your real values in .env
# Open .env and replace all placeholder values with real ones:
# - DATABASE_URL from Supabase
# - JWT_SECRET (make up a long random string)
# - CLOUDINARY_* from Cloudinary dashboard
# - SENDGRID_API_KEY from SendGrid

# Generate Prisma client
npm run db:generate

# Create all database tables
npm run db:migrate

# Fill database with initial data (admin account + 5 services)
npm run db:seed

# Start the backend server
npm run dev
# Server runs at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

## STEP 3 — Setup Frontend

```bash
cd nexus-frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
# Opens at: http://localhost:5173
```

---

## STEP 4 — Login Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@nexusmanaged.in | Admin@Nexus2025! |
| Project Manager | pm@nexusmanaged.in | Manager@2025! |
| Client (test) | client@test.com | Client@2025! |

---

## What Each Panel Does

### Public Website (/)
- Home page with service selector
- Services, About, Contact pages
- Enquiry form that saves to database and emails admin

### Client Portal (/dashboard)
- View all projects with status and progress
- Project detail with 6 tabs: Overview, Services, Timeline, Documents, Messages, Invoices
- Accept or reject quotes
- Download invoice PDFs
- Message project manager

### Admin Panel (/admin)
- Dashboard with stats and revenue chart
- Manage enquiries → convert to projects
- Full project management
- Quote builder with PDF generation
- Invoice creation and payment tracking
- Client and team management
- Services catalog management
- Revenue reports with CSV export

---

## Environment Variables

### nexus-backend/.env

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...  ← from Supabase
JWT_SECRET=your_long_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SENDGRID_API_KEY=SG....
EMAIL_FROM=hello@nexusmanaged.in
EMAIL_FROM_NAME=Nexus Managed Services
FRONTEND_URL=http://localhost:5173
ADMIN_NAME=Nexus Admin
ADMIN_EMAIL=admin@nexusmanaged.in
ADMIN_PASSWORD=Admin@Nexus2025!
```

### nexus-frontend/.env

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Nexus Managed Services
```

---

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new client |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/auth/me | Get current user |
| GET | /api/services | List all services |
| POST | /api/enquiries | Submit contact form |
| GET | /api/projects | List projects (role-filtered) |
| GET | /api/projects/:id | Full project with all data |
| POST | /api/projects | Create project (admin) |
| PUT | /api/projects/:id | Update project |
| POST | /api/milestones/project/:id | Add milestone |
| PUT | /api/milestones/:id/complete | Complete milestone + email |
| POST | /api/quotes | Create quote |
| PUT | /api/quotes/:id/send | Generate PDF + email client |
| PUT | /api/quotes/:id/accept | Client accepts quote |
| POST | /api/invoices | Create invoice |
| PUT | /api/invoices/:id/send | Generate PDF + email |
| PUT | /api/invoices/:id/mark-paid | Record payment |
| POST | /api/documents/project/:id | Upload file to Cloudinary |
| POST | /api/messages/project/:id | Send message |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/reports/revenue | Monthly revenue data |

---

## Deployment (When Ready)

### Backend → Railway
1. Push nexus-backend to GitHub
2. Connect Railway to your GitHub repo
3. Add all .env variables in Railway dashboard
4. Deploy

### Frontend → Vercel
1. Push nexus-frontend to GitHub
2. Connect Vercel to your GitHub repo
3. Add VITE_API_URL pointing to your Railway backend URL
4. Deploy

### Database → Already on Supabase (cloud)

---

## Common Issues

**"Cannot connect to database"**
→ Check DATABASE_URL in .env. Make sure your Supabase project is running.

**"Prisma generate failed"**
→ Run `npm run db:generate` before `npm run db:migrate`

**"Email not sending"**
→ Check SENDGRID_API_KEY. Verify sender identity in SendGrid dashboard.

**"File upload failed"**
→ Check CLOUDINARY_* keys. Make sure the cloud name matches exactly.

**"CORS error in browser"**
→ Check FRONTEND_URL in backend .env matches exactly where your React app runs.

---

## Contact
hello@nexusmanaged.in | +91 98765 43210 | Lucknow, UP
