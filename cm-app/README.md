# Malganga Constructions — Construction Management App

A web app for a contractor managing multiple bungalow construction projects: projects with a
location hierarchy, a customizable stage workflow, per-stage managers, versioned estimates,
expense tracking, dashboards and reports.

- **Live site:** https://malganaga-constructions.web.app
- **Stack:** React 19 + Vite, React Router, Recharts, plain CSS
- **Backend:** Firebase — Authentication (email/password), Cloud Firestore, Hosting.
  There is no custom server.

> **Note:** the Firebase project ID is `malganaga-constructions` (with a typo). Firebase project IDs
> can't be changed, so don't try to "fix" it anywhere.

---

## Getting started

Requires Node.js 18+ and access to the Firebase project.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # oxlint
```

### Environment variables

The Firebase web config lives in `cm-app/.env.local`. It is **not committed** (`*.local` is
gitignored). Create it with these keys. The values are in Firebase Console → Project settings →
General → Your apps → Web app → SDK setup and configuration.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=malganaga-constructions
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

These values identify the project. They are not secrets: security comes from the Firestore rules.
Still, keep them out of the repo.

---

## How it works

### Login and per-user data

- Users sign in with email and password. **Public sign-up is turned off**: only an admin can create
  accounts (see [Adding a user](#adding-a-user)).
- **Every user has completely separate data.** Everything a user creates is stored under their own
  folder, `users/{uid}/...`, and the security rules only let a user read or write their own folder.
- The first time a user logs in, they get the default project stages automatically and see an empty
  dashboard.

### Firestore layout

```
users/{uid}/projects/{id}          project; stageManagers: { [statusId]: memberId }
users/{uid}/estimates/{id}         versioned estimates (projectId, version, items[])
users/{uid}/expenses/{id}          Material / Overhead expenses
users/{uid}/team/{id}              team members (name, role, phone)
users/{uid}/settings/statuses      { list: [...] } — the user's stage workflow, in order

admins/{uid}                       exists = this user is an admin (created by hand in the Console)
activityLogs/{id}                  activity log entries (uid, email, action, summary, at)
```

### Code structure

All Firestore access goes through two context providers, so pages never talk to Firestore directly:

- **`src/context/AuthContext.jsx`:** the signed-in user, `isAdmin`, `login`, `logout` and
  `resetPassword`.
- **`src/context/AppContext.jsx`:** live `onSnapshot` listeners on the user's collections, plus
  `dispatch({ type, payload })`.
  - Pages call `dispatch`. It writes to Firestore, the listeners push the change back into state,
    and the change is recorded in the activity log.
  - To add a new kind of change, add a `case` to `write()` and a description to
    `describeAction()` in `src/utils/activity.js`.

```
src/
  main.jsx                 Entry point (AuthProvider → Router → AppProvider)
  App.jsx                  Login gate, no-access screen, layout shell, routes
  firebase.js              Firebase init from VITE_FIREBASE_* env vars
  index.css                All styling (theme tokens + components)
  context/                 AuthContext.jsx, AppContext.jsx (see above)
  pages/
    Login.jsx              Sign in + "Forgot password?"
    ResetPassword.jsx      Themed reset page for the emailed link (/auth/action)
    Dashboard.jsx          Portfolio stats, stage breakdown, budget alerts
    Projects.jsx           Project grid, create project, manage stages
    ProjectDetail.jsx      Tabs: Overview / Costs / Estimate
    Estimates.jsx          Estimates across projects
    Team.jsx               Team members + per-project stage managers
    Reports.jsx            Budget vs actual, cost vs estimate charts
    Activity.jsx           Admin-only activity log
  components/              Sidebar, Topbar, forms (Project, Member), EstimateBuilder,
                           StatusManager, SuggestInput (type-ahead), Modal, Loader, ...
  utils/
    costs.js               Cost calculations, INR formatting, labor-excluded note
    team.js                Stage-manager lookups
    activity.js            Activity log writer + human-readable action descriptions
    suggest.js             Type-ahead ranking for material suggestions
  data/
    seedData.js            Default stages + sample data
    materials.js           Material suggestions (with units and local names) for estimates
    seedFirestore.js       Uploads sample data into one user's folder (not used by the UI)
```

### Features

- **Projects:** a location hierarchy (State → District → Taluka → Village), budgets and a start date.
- **Stage workflow:** each user has their own customizable stages. They can add a stage at the start
  or end, reorder stages, or delete unused ones.
- **Stage managers:** assign a team member to each stage of each project.
- **Estimates:** versioned estimates with line items, units and material suggestions. Earlier versions
  are kept.
- **Costs:** Material and Overhead expenses, with actual vs. estimate per category.
- **Dashboards and reports:** Recharts charts.
- **Activity log (admins only):** every change, sign-in and sign-out, with filters by user, action and
  text.
- **Forgot password:** a link on the login page. Firebase emails a reset link.
- **Responsive:** the sidebar becomes a drawer on phones.

### Disabled on purpose: workers, attendance and labor cost

Worker allocation, daily attendance and labor cost are **turned off**, not deleted, so they can come
back later. The code is still there:

- `pages/Workers.jsx`, `components/WorkerForm.jsx` and `components/AttendanceSheet.jsx` are unused.
- The route, sidebar link and project tab are commented out.
- Costs use only `COST_CATEGORIES = ['Material', 'Overhead']`.
- A note (`LABOR_EXCLUDED_NOTE`) on the Costs tab, Estimates, Reports and the estimate builder tells
  users that labor isn't included.

---

## Admin tasks (Firebase Console)

### Adding a user
1. Go to **Authentication → Users → Add user** and enter their email and a temporary password.
2. Send them the credentials. They can change the password using **Forgot password?**

That's all. They log in to an empty workspace of their own. Use a real email address, or they can
never reset their password.

### Making someone an admin
1. Copy their **User UID** from **Authentication → Users**.
2. Go to **Firestore → Data → `admins` → Add document**.
   - **Document ID:** their UID. Don't use Auto-ID.
   - **Field:** `name` (string) = their name.
3. They need to sign out and back in. The **Activity log** link then appears in their sidebar.

Admins see everyone's activity log, but **not** other users' projects or data.

### Removing a user
- Go to **Authentication → Users → ⋮ → Delete account** (or **Disable account** to keep their data).
- Their data under `users/{uid}` stays until you delete it in Firestore.

### Resetting someone's password
They can do it themselves from the login page. Or go to **Authentication → Users → ⋮ → Reset password**.

---

## Deploying

The Firebase CLI config is in this folder: `firebase.json`, `.firebaserc` and `firestore.rules`.

```bash
npm install -g firebase-tools   # once
firebase login                  # once, as a Google account with access to the project
npm run build
firebase deploy                 # deploys Hosting (dist/) AND the Firestore rules
```

- **`firebase deploy` overwrites the Console's Firestore rules with `firestore.rules`.** Always edit
  rules in this file, not in the Console, or the next deploy will undo your Console edits.
- `firebase deploy --only hosting` deploys only the app, without touching the rules.
- `firebase.json` sends every route to `index.html`, so links like `/projects/abc` and `/auth/action`
  work when opened directly.

### Security rules (summary)

| Path | Who can read | Who can write |
|---|---|---|
| `users/{uid}/**` | that user only | that user only |
| `admins/{uid}` | that user only (to check "am I admin?") | nobody, Console only |
| `activityLogs/{id}` | admins only | any signed-in user, **create only**, only entries about themselves, stamped with server time; no edits or deletes |

---

## Known gaps and to-dos

- **No backups yet.** Firestore keeps data safe from crashes, but not from mistakes, like a wrong
  edit, a deleted collection or a compromised account. Recommended before relying on the app:
  - Upgrade to the **Blaze** plan and set a budget alert.
  - Then in **Cloud Shell**:
    ```bash
    gcloud config set project malganaga-constructions
    gcloud firestore backups schedules create --database='(default)' --recurrence=daily --retention=14w
    gcloud firestore databases update --database='(default)' --enable-pitr --delete-protection
    ```
  - Restoring a backup creates a **new** database, and the data then has to be switched or copied over.
- **The themed reset page isn't connected yet.** Reset emails still open Firebase's default page.
  - To switch: go to **Authentication → Templates → Password reset → ✏️ → Customize action URL** and
    enter `https://malganaga-constructions.web.app/auth/action`.
  - Saving this failed once with "An error occurred updating action URL". Check that
    `malganaga-constructions.web.app` is in **Authentication → Settings → Authorized domains**, then
    save the action URL on its own.
- **The activity log is written by the browser.** A technical user could add fake entries about
  themselves, but can't edit or delete existing ones. A fully tamper-proof log would need Cloud
  Functions, which require the Blaze plan.
- **The old top-level collections are unused.** `projects`, `estimates`, `expenses`, `team` and
  `settings` at the root of Firestore are from before per-user data. The rules block them, and they
  can be deleted.
- **Bundle size:** the build warns that the main chunk is over 500 kB. Lazy-loading Reports and the
  charts would fix this.

## Handover checklist

- [ ] New owner added as **Owner** in Firebase (Project settings → Users and permissions) and as
  admin on the GitHub repo.
- [ ] Billing (if Blaze) moved to the new owner's billing account.
- [ ] New owner has `.env.local` values (or knows where to copy them from).
- [ ] New owner's `admins/{uid}` document created.
- [ ] Public sign-up confirmed **off** (Authentication → Settings → User actions).
- [ ] 2-step verification on the owner's Google account.
- [ ] Backups set up (see above).
- [ ] Previous owner's access removed after the new owner confirms everything works.
