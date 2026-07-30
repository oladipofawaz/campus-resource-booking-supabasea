# Campus Resource Booking System (React + Supabase)

A full-stack app with **no custom backend server** — React talks directly to
Supabase (Postgres + Auth + Row Level Security). Styling is pure CSS.

## Project Structure

```
campus-resource-booking-supabase/
├── supabase/
│   └── schema.sql     # tables, RLS policies, and the booking function
└── frontend/          # React (Vite) + pure CSS
```

## 1. Create a Supabase Project

1. Go to https://supabase.com, sign up/log in, and create a new project.
2. Wait for it to finish provisioning (~2 min).
3. In the left sidebar, go to **SQL Editor** → **New query**.
4. Paste the entire contents of `supabase/schema.sql` and click **Run**.
   This creates:
   - `profiles`, `resources`, `bookings` tables
   - Row Level Security policies (students see only their own bookings;
     admins see everything; only admins can manage resources)
   - a `book_resource()` function that atomically checks for time-slot
     conflicts before creating a booking

5. Go to **Project Settings > API**. Copy the **Project URL** and the
   **anon public key** — you'll need these next.

## 2. Configure the Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` and paste in your values:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

```bash
npm run dev
```

Runs on `http://localhost:5173`.

## 3. Email Confirmation Setting (important)

By default, Supabase requires email confirmation before a new user can log
in. For a quick demo/dev flow, turn this off:

**Authentication > Providers > Email > toggle off "Confirm email"**

(You can turn it back on later for a more "production" feel if your project
report wants to discuss it.)

## How to Use It

1. Sign up as **admin** first (role dropdown on the signup page).
2. Log in as admin → **Admin > Manage Resources** → add a few resources
   (e.g. "Lab A", type "Lab", location "Block 2, Room 101").
3. Sign up a second account as **student**.
4. As the student, browse resources on the home page and click **Book Now**.
5. Log back in as admin → **Admin > Booking Requests** → approve/reject.
6. As the student, check **My Bookings** to see the status update.

## Key Feature to Highlight in Your Report/Viva

The `book_resource()` Postgres function in `supabase/schema.sql` is the core
piece of business logic: it checks for overlapping bookings against existing
**pending or approved** bookings for the same resource/date, and only inserts
if there's no conflict — all in a single atomic database transaction. This
avoids race conditions you'd get from checking in JavaScript and inserting
separately.

Row Level Security is the other strong talking point: instead of role checks
scattered through backend route handlers, access rules live directly on the
database tables (e.g. "students can only see their own bookings", "only
admins can insert resources") — this is a modern approach worth explaining
if asked about your architecture choices.

## Known Simplifications (worth mentioning if asked)

- Signup lets a user pick "admin" directly for demo convenience. In a real
  deployment, admin accounts would be provisioned separately, not
  self-selected at signup.
- No email notifications — booking status is only visible in-app.

## Suggested Stretch Goals (if you have extra time)

- Calendar view showing resource availability visually
- Supabase Realtime subscription so admins see new booking requests live
  without refreshing
- CSV export of booking history
- Recurring bookings (e.g. weekly club meeting)
