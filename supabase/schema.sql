-- ============================================================
-- Campus Resource Booking System — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- 1. PROFILES
-- Extends auth.users with app-specific fields (name, role)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- Automatically create a profile row whenever someone signs up.
-- Reads "name" and "role" out of the signup metadata (see frontend signup call).
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Unnamed'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper: is the current user an admin?
create function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 2. RESOURCES
create table resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  location text not null,
  capacity int default 1,
  description text default '',
  created_at timestamptz default now()
);

-- 3. BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  purpose text default '',
  created_at timestamptz default now(),
  constraint valid_time_range check (start_time < end_time)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table resources enable row level security;
alter table bookings enable row level security;

-- Profiles: anyone logged in can view profiles (needed so admins see student names).
-- Users can only update their own profile.
create policy "profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Resources: viewable by anyone logged in; only admins can add/edit/delete.
create policy "resources are viewable by authenticated users"
  on resources for select
  to authenticated
  using (true);

create policy "only admins can insert resources"
  on resources for insert
  to authenticated
  with check (is_admin());

create policy "only admins can update resources"
  on resources for update
  to authenticated
  using (is_admin());

create policy "only admins can delete resources"
  on resources for delete
  to authenticated
  using (is_admin());

-- Bookings: students see only their own; admins see everything.
create policy "users see own bookings, admins see all"
  on bookings for select
  to authenticated
  using (auth.uid() = user_id or is_admin());

-- Inserts happen through the book_resource() function below (not directly),
-- but this policy allows the function (running as the caller) to succeed.
create policy "users can insert their own bookings"
  on bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only admins can change status (approve/reject).
create policy "only admins can update booking status"
  on bookings for update
  to authenticated
  using (is_admin());

-- ============================================================
-- BOOKING FUNCTION — the key "business logic" piece
-- Prevents double-booking by checking for overlapping time slots
-- against existing pending/approved bookings, atomically.
-- ============================================================
create function book_resource(
  p_resource_id uuid,
  p_date date,
  p_start_time time,
  p_end_time time,
  p_purpose text default ''
)
returns bookings as $$
declare
  conflict_count int;
  new_booking bookings;
begin
  if p_start_time >= p_end_time then
    raise exception 'Start time must be before end time';
  end if;

  select count(*) into conflict_count
  from bookings
  where resource_id = p_resource_id
    and date = p_date
    and status in ('pending', 'approved')
    and p_start_time < end_time
    and start_time < p_end_time;

  if conflict_count > 0 then
    raise exception 'This resource is already booked for an overlapping time slot';
  end if;

  insert into bookings (user_id, resource_id, date, start_time, end_time, purpose)
  values (auth.uid(), p_resource_id, p_date, p_start_time, p_end_time, p_purpose)
  returning * into new_booking;

  return new_booking;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SEED DATA (optional — remove or edit as you like)
-- ============================================================
-- insert into resources (name, type, location, capacity, description) values
--   ('Lab A', 'Lab', 'Block 2, Room 101', 30, 'Computer lab with 30 workstations'),
--   ('Seminar Room 1', 'Seminar Room', 'Block 1, Room 12', 20, 'Projector and whiteboard'),
--   ('Basketball Court', 'Court', 'Sports Complex', 10, 'Outdoor court');
