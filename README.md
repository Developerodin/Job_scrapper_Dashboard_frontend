# Dharwin Job Scraper — Frontend

Dashboard UI for searching LinkedIn jobs, viewing results, and managing saved jobs stored in MongoDB.

---

## Tech Stack

| Category        | Technology  | Purpose |
|-----------------|-------------|---------|
| **Framework**   | Next.js 16  | React framework, App Router |
| **UI Library**  | React 18    | Components, state |
| **Language**    | TypeScript  | Type safety |
| **Styling**     | Tailwind CSS 3 | Utility-first CSS |
| **HTTP Client** | Axios       | API calls to backend |
| **Forms**       | react-hook-form | Form state & validation |
| **Dates**       | date-fns    | Date formatting |
| **Build**       | PostCSS, Autoprefixer | CSS processing |

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main dashboard
│   └── globals.css     # Global styles
├── components/
│   ├── ConnectionStatus.tsx  # API status
│   ├── JobCard.tsx           # Single job card
│   ├── JobFilters.tsx        # Search filters form
│   ├── JobList.tsx           # Jobs list + sort + Load More
│   └── SavedJobs.tsx         # Saved jobs from DB
├── lib/
│   └── api.ts          # API client & types
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Features

- **Job search** — Title, location, filters (salary, experience, job type, remote, company)
- **Pagination** — Load more jobs from API
- **Saved jobs** — View jobs stored in MongoDB with filters and stats
- **Verify & cleanup** — Trigger job maintenance from the UI
- **Responsive layout** — Mobile-friendly

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Setup

```bash
cd frontend
npm install
# Ensure NEXT_PUBLIC_API_URL points to your backend
npm run dev
```

Runs at `http://localhost:3000` by default.

---

## Scripts

| Command       | Description          |
|---------------|----------------------|
| `npm run dev` | Development server   |
| `npm run build` | Production build   |
| `npm start`   | Run production build |
| `npm run lint` | Next.js lint        |

---

## API Integration

The frontend calls the backend at `NEXT_PUBLIC_API_URL`:

- `POST /api/jobs/search` — Search jobs
- `GET /api/jobs/database` — Saved jobs
- `GET /api/jobs/stats` — DB stats
- `POST /api/jobs/maintenance` — Verify & cleanup
