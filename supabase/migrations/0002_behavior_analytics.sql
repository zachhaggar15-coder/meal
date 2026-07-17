-- First-party behaviour analytics
-- Run this in the Supabase SQL editor after 0001_interest_registrations.sql.
-- Safe to re-run: uses IF NOT EXISTS / idempotent guards.

create extension if not exists "pgcrypto";

create table if not exists public.analytics_sessions (
  session_id             text primary key,
  created_at             timestamptz not null default now(),
  last_seen_at           timestamptz not null default now(),
  entry_path             text,
  entry_url              text,
  entry_title            text,
  entry_referrer         text,
  entry_referrer_host    text,
  entry_source           text,
  entry_intent           text,
  utm_source             text,
  utm_medium             text,
  utm_campaign           text,
  utm_term               text,
  device_category        text,
  viewport_width         integer,
  viewport_height        integer,
  screen_width           integer,
  screen_height          integer,
  language               text,
  timezone               text,
  consent_state          text,
  metadata               jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_events (
  id                     uuid primary key default gen_random_uuid(),
  received_at            timestamptz not null default now(),
  occurred_at            timestamptz,
  session_id             text not null references public.analytics_sessions (session_id) on delete cascade,
  event_name             text not null,
  path                   text,
  page_title             text,
  page_category          text,
  source_page            text,
  target_text            text,
  target_role            text,
  target_tag             text,
  target_href            text,
  target_host            text,
  target_id              text,
  section_heading        text,
  section_level          text,
  section_index          integer,
  scroll_depth           integer,
  active_time_ms         integer,
  time_on_page_ms        integer,
  visible_section_count  integer,
  viewport_width         integer,
  viewport_height        integer,
  metadata               jsonb not null default '{}'::jsonb
);

create index if not exists analytics_sessions_created_at_idx
  on public.analytics_sessions (created_at desc);
create index if not exists analytics_sessions_last_seen_at_idx
  on public.analytics_sessions (last_seen_at desc);
create index if not exists analytics_sessions_entry_intent_idx
  on public.analytics_sessions (entry_intent);
create index if not exists analytics_sessions_entry_source_idx
  on public.analytics_sessions (entry_source);

create index if not exists analytics_events_received_at_idx
  on public.analytics_events (received_at desc);
create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);
create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id);
create index if not exists analytics_events_name_idx
  on public.analytics_events (event_name);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

-- No public policies. The browser posts to /api/analytics; private reads happen
-- through /api/admin-stats with the service role key and admin token.
revoke all on public.analytics_sessions from anon;
revoke all on public.analytics_sessions from authenticated;
revoke all on public.analytics_events from anon;
revoke all on public.analytics_events from authenticated;
