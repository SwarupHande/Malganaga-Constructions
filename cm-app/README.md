# SiteFlow — Construction Management App (React)

A responsive React web app for a contractor managing multiple bungalow construction
projects: project creation with a location hierarchy, a customizable status workflow,
worker allocation & daily attendance, cost tracking, and a versioned estimation module,
plus dashboards and reports. Built from the product proposal for a multi-project
bungalow contractor.

This is a front-end-only demo: all data lives in React state (seeded with sample
projects/workers/estimates) via Context + `useReducer`. There is no backend — refreshing
the page resets any changes back to the seed data. Swapping in a real API later only
means replacing the reducer's data source, since all screens read from the shared
`AppContext`.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev       # start the dev server (usually http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  main.jsx                 App entry point (Router + AppProvider)
  App.jsx                  Layout shell: sidebar, topbar, routes
  index.css                All styling (theme tokens + components, plain CSS)
  context/
    AppContext.jsx          Global state: projects, workers, attendance, estimates...
  data/
    seedData.js              Sample/mock data + location hierarchy + status list
  utils/
    costs.js                 Cost/labor calculation helpers (pure functions)
  components/
    Sidebar.jsx, Topbar.jsx        Navigation shell
    StatusBadge.jsx, StatCard.jsx  Small presentational pieces
    Modal.jsx                      Reusable dialog
    ProjectForm.jsx                Create-project form (name, hierarchical location...)
    StatusManager.jsx              Add / reorder / delete workflow statuses
    WorkerForm.jsx                  Add-worker form
    AttendanceSheet.jsx            Mark daily attendance for a project
    EstimateBuilder.jsx            Line-item estimate builder with running totals
  pages/
    Dashboard.jsx    Portfolio stats, status breakdown, budget alerts, recent projects
    Projects.jsx      Filterable project grid + create project / manage statuses
    ProjectDetail.jsx Tabs: Overview / Workers & Attendance / Costs / Estimate
    Workers.jsx        Worker roster + add worker
    Reports.jsx        Budget vs actual, cost vs estimate, labor-cost trend charts
```

## Feature coverage

- **Project creation** with hierarchical location (State -> District -> Taluka -> Village),
  defaulting to Pune, Maharashtra.
- **Customizable status workflow** - add, reorder, or delete stages (Planning -> Foundation
  -> Structure -> Finishing -> Completed -> On Hold, etc.).
- **Worker allocation & daily attendance** - assign workers to a project, mark who was
  present each day, hours auto-computed into that day's labor cost.
- **Estimation module** - versioned estimates with Material / Labor / Overhead line
  items, auto-totaled, with prior versions kept for reference.
- **Cost tracking** - actual labor cost is derived automatically from attendance; material
  and overhead expenses are logged separately; Actual vs. Estimated shown per category.
- **Dashboards & reports** - portfolio stats, status breakdown, budget-overrun alerts,
  cost-vs-estimate bar charts, estimate breakdown pie chart, and a daily labor-cost trend
  line chart (via Recharts).
- **Responsive UI** - collapsible sidebar becomes a slide-in drawer under 768px, grids and
  tables reflow for phone-width screens.

## Notes for wiring up a real backend

Every mutation goes through `dispatch({ type, payload })` in `AppContext.jsx` - replace
the in-memory `reducer` with calls to your REST API (matching the endpoints outlined in
the product proposal, e.g. `POST /api/projects`, `POST /api/attendance`, etc.) and load
`initialState` from the API on mount instead of the local `seedData.js`.
