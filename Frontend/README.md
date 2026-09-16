# How to drop this into your real Angular project

## 1. Replace `src/` only

Delete your current `src/` folder and copy this package's `src/` in its
place. Everything is wired: `main.ts` bootstraps `app/app.ts`, which reads
`app/app.routes.ts`, which lazy-loads every page (home, login, register,
book-appointment, payment, dashboard, doctor-dashboard, admin).

**Do NOT touch:** `angular.json`, `package.json`, `tsconfig*.json`,
`node_modules/`, `public/`. Those stay exactly as your project already has
them.

## 2. Add Tailwind at the project root (next to angular.json)

Copy `tailwind.config.js` and `postcss.config.js` from this package into
your project's root folder.

## 3. Install Tailwind (if not already installed)

```
npm install -D tailwindcss postcss autoprefixer
```

## 4. Run it

```
ng serve
```

`/` shows the homepage. `/login`, `/register`, `/book-appointment`,
`/payment`, `/dashboard` (patient), `/doctor-dashboard`, `/admin` all
resolve — most are still TODO placeholders per the team-split table below,
but nothing will 404 or throw a build error.

## Team split (folder = ownership)

| Collection(s)                 | Folder(s)                           | Owner    |
|-------------------------------|-------------------------------------|----------|
| users, patients, doctors      | `users/`, `patients/`, `doctors/`   |   Moaz   |
| appointments, notifications   | `appointments/`, `notifications/`   |  Radwan  |
| reviews, payments             | `reviews/`, `payments/`             |   Nasef  |
| medicalReports, medicine      | `medical-reports/`, `medicine/`     |   Rawda  |
| auditLogs, departments        | `audit-logs/`, `departments/`       |   Hager  |

`shared/` = common layout (navbar, footer, hero, etc.) — shared, not owned
by one person. `admin/admin-dashboard` is a cross-cutting overview page
that links into everyone's management sections.

Fully working with Tailwind already: `shared/*`, `doctors/doctor-card` +
`doctors-list`, `departments/department-card` + `departments-list`,
`reviews/review-card` + `reviews-list`, `pages/home`, `admin/admin-dashboard`.

Everything else is a scaffolded placeholder component with a `// TODO`
comment naming the exact API endpoint and the responsible person — replace
the placeholder markup with real logic, the route already points to it.
