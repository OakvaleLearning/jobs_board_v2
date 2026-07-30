# Oakvale Jobs Board

A gated, credential-verified workforce marketplace connecting certified Nigerian caregivers and
childcare workers with individual families and organisations. It now covers the full managed-service
lifecycle: **jobs → application → hiring → contracts → placement → welfare/CPD → complaints → billing**.

Built with **Next.js 16 (App Router)**, **Prisma 7 + PostgreSQL**, **Material UI v9**, **Auth.js v5**,
**Framer Motion**, and **pdf-lib**. Light theme only, Oakvale green + gold branding.

## What's included

### Foundation (stage 1)
- **Four roles** (Worker, Employer, Agent, Admin) with server-enforced role-based access.
- **Worker portal** — multi-section profile with auto-save and a live completion ring, ID/selfie/
  address/conduct document uploads (auto-compressed), Oakvale certificate upload (number optional),
  job browsing, applications, interview & offer responses, and mediated messaging.
- **Employer portal** — individual & organisation onboarding (organisations upload a CAC document),
  job posting with a configurable **care-type** field, verified-worker search (contact details
  masked until hire), shortlists, applicant review, interview requests, and offers.
- **Admin console** — employer verification, worker approval, **certificate cross-check with CSV
  export**, job-post review, offer release, configurable **taxonomy**, and an audit log.
- **Dual application gate** — a worker can only apply once their profile *and* certificate are
  admin-approved (enforced server-side).
- **Notifications** — in-app bell + transactional email via **Resend** (logs to console without a key).
- **Audit trail** on every state-changing action (actor, IP, timestamp).

### Placement lifecycle & operations (stage 2)
- **Contracts & digital signing** — accepting an offer auto-generates a **Worker Placement Agreement**
  and **Employer Service Agreement** from admin-managed, versioned templates, rendered to branded PDFs.
  Each party signs their side (authenticated checkbox + timestamp); Oakvale counter-signs on generation.
  Admin **contract template library** at `/admin/templates`.
- **Placement management** — per-role placement dashboards with contract status, a **90-day replacement
  guarantee** countdown, **CPD compliance** tracking (overdue drops a worker out of search), welfare
  history, and invoices. Agents **log welfare checks** (auto-emailed welfare-report PDF; amber/red
  raises an escalation) and can **request replacements**.
- **Complaints & resolution** — typed complaint taxonomy with derived **urgency + SLA**, a case
  reference, and the six-stage agent workflow (triage → acknowledge → investigate → resolve →
  communicate → close) with SLA colour-coding. Safeguarding complaints **auto-suspend** the worker;
  complainants can reopen within 7 days.
- **Agent Dashboard** (`/agent`) — a **My Tasks** queue (verifications, offers, welfare due, contracts,
  open cases), employer **accounts** with account-manager assignment, all **placements**, the
  **complaints** dashboard, and a transparent **matching tool** that ranks verified workers for a role
  and sends them to the employer's shortlist.
- **Pipeline intake forms** — a **Care Needs Assessment** (individual/diaspora) or **Workforce
  Requirements** form (organisation/corporate), shown based on the employer's account type and
  pre-filled from live profile data.
- **NGN billing via Paystack** — a placement-fee invoice is issued on placement activation; employers
  pay from `/employer/billing`. Without a Paystack key, a **"Simulate payment"** fallback marks the
  invoice paid (Stripe/diaspora GBP remains out of scope).

### Reviews & learned matching (stage 3)
- **Two-sided ratings & reviews** — after a placement ends (or passes its guarantee window), the
  employer reviews the worker **and** the worker reviews the employer (1–5 stars + comment). Worker
  reviews appear on the worker's search profile to prospective employers; the worker sees their own on
  `/worker/reviews`. Agents/admins see everything and can **hide** an abusive review (`/agent/reviews`),
  which recomputes the subject's rating.
- **Outcome-learned matching** — the candidate ranker scores each worker as a transparent weighted sum
  of factors (category, location, relocation, employment-type, availability, **rating**). Base weights
  are **admin-editable** at `/admin/matching`; the system **auto-tunes** them from historical placement
  outcomes (ratings, complaints, replacements) and blends toward the admin defaults by sample size, so
  it degrades gracefully when data is sparse. The agent Matching tool shows the live weights so ranking
  stays explainable. Weights recompute automatically on each review, placement end, replacement, or
  resolved complaint.

## Requirements

- Node.js 20.9+ (tested on 24)
- PostgreSQL 16+ (Docker is easiest)

## Setup

```bash
# 1. Start Postgres (example with Docker)
docker run -d --name oakvale-jobsboard-db \
  -e POSTGRES_USER=oakvale -e POSTGRES_PASSWORD=oakvale_dev_pw \
  -e POSTGRES_DB=oakvale_jobsboard -p 5435:5432 postgres:16-alpine

# 2. Configure environment
cp .env.example .env          # then edit values as needed

# 3. Install, migrate, seed
npm install
npx prisma migrate dev
npx prisma db seed

# 4. Run
npm run dev                   # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js session secret (`npx auth secret`) |
| `NEXT_PUBLIC_APP_URL` | Base URL used in notification email links |
| `RESEND_API_KEY` | Resend key for email (optional in dev — emails log to console) |
| `EMAIL_FROM` | From address for notification email |
| `STORAGE_DIR` | Local directory for uploaded documents & generated PDFs |
| `PAYSTACK_SECRET_KEY` | Paystack test/live secret key (optional — dev uses a simulate-payment fallback) |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (optional) |

## Sample logins

All seeded accounts use the password **`Password123!`**.

| Email | Role |
| --- | --- |
| `admin@oakvale.test` | Platform Admin |
| `agent@oakvale.test` | Oakvale Agent |
| `worker@oakvale.test` | Worker (approved, searchable, has applied to a live job) |
| `family@oakvale.test` | Individual employer (verified) |
| `corp@oakvale.test` | Organisation employer (verified, has a live job) |

## End-to-end test (UAT walkthrough)

1. **Sign up** at `/signup` — pick a role, choose *Personal referral* to reveal the referrer-name field.
2. **Worker**: complete your profile to ≥70%, upload an ID and certificate, submit for review.
3. **Admin** (`/admin`): verify an employer, approve the worker profile, approve the certificate
   (try **Export pending to CSV** on `/admin/certificates`). Confirm the worker can only apply after
   *both* approvals.
4. **Employer**: post a job (`/employer/jobs/new`) with a care type → **Admin** approves it on
   `/admin/jobs`.
5. **Worker**: apply to the public job → **Employer** reviews the applicant, requests an interview,
   then makes an offer → **Admin** releases the offer on `/admin/offers` → **Worker** accepts →
   a **placement** is created and the worker's contact details are released to the employer.
6. **Messaging**: from a worker's profile the employer can start a conversation; sharing phone
   numbers or emails is automatically blocked.

## Project structure

```
app/            Routes: (marketing), (auth), worker/, employer/, admin/, api/
components/     Shared UI (shell, motion, admin/worker/employer widgets)
lib/            prisma, auth, session/RBAC, storage, email, notifications, validation, constants
prisma/         schema.prisma, migrations, seed.ts
generated/      Prisma client (gitignored)
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed taxonomy + sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset and reseed the database |

## Deferred (next phases)

Qualified e-signatures (DocuSign), Stripe/diaspora GBP payments, WhatsApp welfare delivery, and the
SMS / Sterling BackCheck / Oakvale LMS integrations remain out of scope. Digital signing here is
affirmative-consent (checkbox + timestamp), per the brief; the architecture leaves room for a qualified
e-signature step to be added later.
