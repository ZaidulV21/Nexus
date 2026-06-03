# Project Manager References - Complete List

## Overview
This document lists all references to "project manager", "projectManager", "PROJECT_MANAGER", and related variations across the Nexus application that need to be removed if this feature is being deprecated.

---

## DATABASE & MIGRATIONS

### 1. [nexus-backend/prisma/schema.prisma](nexus-backend/prisma/schema.prisma)
**References to remove:**
- Line 9: Enum value `PROJECT_MANAGER` in Role enum
- Line 86: Field `managerId` in User model (relation field)
- Line 87: Relation `managedProjects` in User model
- Line 94: Field `managerId` in Project model
- Line 95: Relation `manager` in Project model (nullable)

**Impact:** These define the core PM data model. Removing requires:
1. Delete the `PROJECT_MANAGER` role from the Role enum
2. Delete `managerId` field and `manager` relation from Project model
3. Delete `managedProjects` relation and `managerId` field from User model

---

### 2. [nexus-backend/prisma/migrations/20260509090947_init/migration.sql](nexus-backend/prisma/migrations/20260509090947_init/migration.sql)
**References to remove:**
- Line 1: `PROJECT_MANAGER` in Role enum creation
- Multiple lines in User table creation (managedProjects relation tracking)
- Multiple lines in Project table creation (managerId field and manager foreign key)

**Impact:** This is the initial migration. A new migration must be created to drop the managerId column and PROJECT_MANAGER role.

---

## BACKEND - CONTROLLERS

### 3. [nexus-backend/src/controllers/admin.controller.js](nexus-backend/src/controllers/admin.controller.js)
**References to remove:**
- Line 24: In `recentProjects` query: `manager: { select: { name:true } }`

**What to change:** Remove manager from the include/select statement when fetching recent projects for dashboard stats.

---

### 4. [nexus-backend/src/controllers/projects.controller.js](nexus-backend/src/controllers/projects.controller.js)
**References to remove:**
- Line 6: `manager: { select: { id:true, name:true, email:true, phone:true } },` from projectIncludes
- Line 22: `if (role === 'PROJECT_MANAGER') where.managerId = id` (entire line)
- Line 30: `manager: { select: { id:true, name:true } },` from include
- Line 54: `const { clientId, managerId, ...` (destructure managerId parameter)
- Line 59: `managerId,` from project create data
- Line 73: `const { status, managerId, ...` (destructure managerId parameter)
- Line 78: `...(managerId !== undefined && { managerId }),` (entire conditional)
- Line 86: `manager: { select:{id:true,name:true} }` from include

**What to change:** Remove all managerId parameters from create/update functions, remove manager from all include statements, remove PM role check from getAllProjects.

---

### 5. [nexus-backend/src/controllers/enquiries.controller.js](nexus-backend/src/controllers/enquiries.controller.js)
**References to remove:**
- Line 79: `const { managerId, ...` (destructure managerId parameter)
- Line 108: `managerId: managerId || null,` from project create data

**What to change:** Remove managerId from convertToProject function parameters and data.

---

### 6. [nexus-backend/src/controllers/quotes.controller.js](nexus-backend/src/controllers/quotes.controller.js)
**References to remove:**
- Line 11: `['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(role) ?` (role check)
- Line 24: `manager: { select:{id:true,name:true,email:true} }` from include

**What to change:** Update role check to only include ADMIN and SUPER_ADMIN. Remove manager from include.

---

### 7. [nexus-backend/src/controllers/invoices.controller.js](nexus-backend/src/controllers/invoices.controller.js)
**References to remove:**
- Line 11: `['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(role) ?` (role check)

**What to change:** Update role check to only include ADMIN and SUPER_ADMIN.

---

### 8. [nexus-backend/src/controllers/messages.controller.js](nexus-backend/src/controllers/messages.controller.js)
**References to remove:**
- Line 30: `manager: true` from include
- Line 34: `const recipient = isClient ? project.manager : project.client` (logic depends on PM)

**Impact:** This affects messaging logic. Need to rethink recipient determination if removing PM role. May need to modify to only support client-to-admin messaging, or change logic significantly.

---

## BACKEND - MIDDLEWARE

### 9. [nexus-backend/src/middleware/role.js](nexus-backend/src/middleware/role.js)
**References to remove:**
- Line 12: `const isAdminOrPM = allowRoles('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER')`

**What to change:** Delete the isAdminOrPM constant and update any routes/controllers that use it to use isAdmin instead.

---

## BACKEND - SERVICES

### 10. [nexus-backend/src/services/email.service.js](nexus-backend/src/services/email.service.js)
**References to remove:**
- Line 73 (in sendClientCredentials): "...and communicate with your project manager."

**What to change:** Reword email template to remove reference to project manager communication.

---

## BACKEND - ROUTES

### 11. [nexus-backend/src/routes/admin.routes.js](nexus-backend/src/routes/admin.routes.js)
**Status:** ✅ No PM-specific references found. Routes use generic middleware.

---

## SEED DATA

### 12. [nexus-backend/prisma/seed.js](nexus-backend/prisma/seed.js)
**References to remove:**
- Line 82: `// ── Sample Project Manager ───────────────────────────────` (comment)
- Any code that creates sample PROJECT_MANAGER users

**What to change:** Remove or comment out PM user creation if present in seed data.

---

## FRONTEND - GLOBAL

### 13. [nexus-frontend/src/App.jsx](nexus-frontend/src/App.jsx)
**References to remove:**
- Line 33: `const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER']`

**What to change:** Update to `const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN']`

**Impact:** This affects all admin route protection. Must also check PublicNavbar.jsx and LoginPage.jsx which reference this concept.

---

### 14. [nexus-frontend/src/components/layout/PublicNavbar.jsx](nexus-frontend/src/components/layout/PublicNavbar.jsx)
**References to remove:**
- Line 13: `['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(user.role) ?` (role check)

**What to change:** Update to check only `['SUPER_ADMIN','ADMIN'].includes(user.role)`

---

### 15. [nexus-frontend/src/pages/auth/LoginPage.jsx](nexus-frontend/src/pages/auth/LoginPage.jsx)
**References to remove:**
- Line 20: `if (['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(user.role))` (role check)

**What to change:** Update to check only `['SUPER_ADMIN','ADMIN'].includes(user.role)`

---

## FRONTEND - ADMIN PAGES

### 16. [nexus-frontend/src/pages/admin/Enquiries.jsx](nexus-frontend/src/pages/admin/Enquiries.jsx)
**References to remove:**
- Line 17: `const [form, setForm] = useState({ title:'', location:'', managerId:'' })`
- Line 18: `const [managers, setManagers] = useState([])`
- Line 31: `api.get('/admin/users?role=PROJECT_MANAGER')`
- Line 32: `.then(r => setManagers(r.data.users))`
- Line 50: `managerId: form.managerId || undefined,` (from API call)
- Line 54: `setForm({ title:'', location:'', managerId:'' })` (form reset)
- Line 127: `setForm({ title:\`${e.name} — Project\`, location:'', managerId:'' })` (form reset)
- Lines 168-172: Entire "Assign Project Manager" form section with select dropdown

**What to change:** Remove PM assignment UI from enquiry conversion modal. Remove managers state and API call to fetch PMs.

---

### 17. [nexus-frontend/src/pages/admin/Projects.jsx](nexus-frontend/src/pages/admin/Projects.jsx)
**References to remove:**
- Line 19: `const [managers, setManagers] = useState([])`
- Line 21: `managerId:''` from form state initialization
- Line 36: `api.get('/admin/users?role=PROJECT_MANAGER'),` (from Promise.all)
- Line 37-38: `setManagers(m.data.users)` assignment
- Line 144: Table header column showing "Manager"
- Line 144 (in table): Display `{p.manager?.name || <span>—</span>}`
- Lines 150-155: Entire "Project Manager" form field in create project modal

**What to change:** Remove managers state, remove PM API call, remove manager column from projects table, remove PM assignment field from create project form.

---

### 18. [nexus-frontend/src/pages/admin/ProjectDetail.jsx](nexus-frontend/src/pages/admin/ProjectDetail.jsx)
**References to remove:**
- Line 17: `const [managers, setManagers] = useState([])`
- Lines 41-42: `api.get('/admin/users?role=PROJECT_MANAGER').then(...)`
- Lines 63-64: `const assignManager = async (managerId)` function
- Lines 74-76: Call to assignManager function
- Lines 185-191: Entire "Assign Project Manager" card section with select dropdown and avatar display

**What to change:** Remove managers state and API call. Remove assignManager function. Remove the entire PM assignment UI section from overview tab.

---

## FRONTEND - CLIENT PAGES

### 19. [nexus-frontend/src/pages/client/ProjectDetail.jsx](nexus-frontend/src/pages/client/ProjectDetail.jsx)
**References to remove:**
- Lines 107-117: Entire "Your Project Manager" section in overview tab, including:
  - Section heading
  - Avatar display with PM name, email, phone
  - "Not yet assigned" fallback message

**What to change:** Remove the entire PM display card from the client project overview. Clients won't see who their manager is.

---

### 20. [nexus-frontend/src/pages/client/Dashboard.jsx](nexus-frontend/src/pages/client/Dashboard.jsx)
**References to remove:**
- Line 112 (approx): Table column header `<th>PM</th>` (hidden on mobile)
- Table cell displaying `{p.manager?.name || '—'}`

**What to change:** Remove the PM column from the client projects table on dashboard.

---

## README & DOCUMENTATION

### 21. [README.md](README.md)
**References to remove:**
- Line 87: Project Manager credentials table row: `| Project Manager | pm@nexusmanaged.in | Manager@2025! |`
- Line 104: Feature list item: `- Message project manager`

**What to change:** Remove PM credentials and feature mention from documentation.

---

## SUMMARY BY IMPACT LEVEL

### 🔴 CRITICAL (Database & Data Model)
- Delete PROJECT_MANAGER from Role enum in schema.prisma
- Delete managerId field and manager relation from Project model
- Create new migration to drop managerId column
- Update seed.js if it contains PM user creation

### 🟠 HIGH (Authentication & Authorization)
- Remove PROJECT_MANAGER from all role checks
- Remove isAdminOrPM middleware from role.js
- Update ADMIN_ROLES array in frontend App.jsx

### 🟡 MEDIUM (UI & Forms)
- Remove PM assignment UI from 3 admin pages (Enquiries, Projects, ProjectDetail)
- Remove PM assignment from enquiry conversion
- Remove PM display from client project detail
- Remove PM column from client dashboard table
- Update 2 auth/navigation files with role checks

### 🟢 LOW (Content & Polish)
- Update email templates to remove PM references
- Update README.md credentials and features
- Remove seed data for PM users
- Update messages.controller.js logic for message recipient determination

---

## FILES REQUIRING CHANGES: COMPLETE LIST

**Backend (10 files):**
1. nexus-backend/prisma/schema.prisma
2. nexus-backend/prisma/migrations/20260509090947_init/migration.sql
3. nexus-backend/prisma/seed.js (if contains PM data)
4. nexus-backend/src/controllers/admin.controller.js
5. nexus-backend/src/controllers/projects.controller.js
6. nexus-backend/src/controllers/enquiries.controller.js
7. nexus-backend/src/controllers/quotes.controller.js
8. nexus-backend/src/controllers/invoices.controller.js
9. nexus-backend/src/controllers/messages.controller.js
10. nexus-backend/src/middleware/role.js
11. nexus-backend/src/services/email.service.js

**Frontend (8 files):**
12. nexus-frontend/src/App.jsx
13. nexus-frontend/src/components/layout/PublicNavbar.jsx
14. nexus-frontend/src/pages/auth/LoginPage.jsx
15. nexus-frontend/src/pages/admin/Enquiries.jsx
16. nexus-frontend/src/pages/admin/Projects.jsx
17. nexus-frontend/src/pages/admin/ProjectDetail.jsx
18. nexus-frontend/src/pages/client/ProjectDetail.jsx
19. nexus-frontend/src/pages/client/Dashboard.jsx

**Documentation (1 file):**
20. README.md

---

## MIGRATION STRATEGY

### Phase 1: Database
1. Create new migration to drop managerId column from projects table
2. Create new migration to remove PROJECT_MANAGER from Role enum

### Phase 2: Backend
1. Update schema.prisma to remove PM model references
2. Update all controllers to remove managerId handling
3. Update role.js middleware
4. Update email templates
5. Update seed.js

### Phase 3: Frontend
1. Update role-based constants in App.jsx
2. Update auth/routing logic
3. Remove PM UI from all admin pages
4. Remove PM display from client pages
5. Update navigation component

### Phase 4: Documentation
1. Update README.md with new credentials and features
2. Remove PM from feature list

---

**Last Updated:** May 31, 2026
**Total References Found:** 50+ across 20 files
