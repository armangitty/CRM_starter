-- Attribution on booked calls from Facebook ads / Instant Forms

alter table public.bookings
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists bookings_attribution_source_idx
  on public.bookings ((attribution->>'channel'));
