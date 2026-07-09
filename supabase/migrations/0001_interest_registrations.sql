-- MealPrep+ waitlist / interest registrations
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query > Run).
-- Safe to re-run: uses IF NOT EXISTS / idempotent guards.

-- gen_random_uuid() lives in pgcrypto on Supabase.
create extension if not exists "pgcrypto";

create table if not exists public.interest_registrations (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  email               text not null,
  first_name          text,
  supermarket         text,
  goal                text,
  source_page         text,
  subscribed          boolean not null default true,
  welcome_email_sent  boolean not null default false,
  notes               text
);

-- One row per email address. Emails are stored lower-cased by the API.
create unique index if not exists interest_registrations_email_key
  on public.interest_registrations (email);

-- Helpful indexes for the admin dashboard, exports and future segmentation.
create index if not exists interest_registrations_created_at_idx
  on public.interest_registrations (created_at desc);
create index if not exists interest_registrations_subscribed_idx
  on public.interest_registrations (subscribed);
create index if not exists interest_registrations_supermarket_idx
  on public.interest_registrations (supermarket);
create index if not exists interest_registrations_goal_idx
  on public.interest_registrations (goal);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS and add NO policies for anon/authenticated. With RLS on and no
-- policies, the public anon key can neither read nor write this table.
-- All access happens server-side through /api/waitlist and /api/admin-stats
-- using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. This keeps every
-- email address private and prevents public scraping of the list.
alter table public.interest_registrations enable row level security;

-- Belt-and-braces: make sure the public roles hold no table grants either.
revoke all on public.interest_registrations from anon;
revoke all on public.interest_registrations from authenticated;
