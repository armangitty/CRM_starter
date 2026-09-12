-- Leadport: agency CRM + client portals + ads leads + bookings

create extension if not exists pgcrypto;

create type public.user_role as enum (
  'agency_owner',
  'agency_admin',
  'agency_staff',
  'client_admin',
  'client_user'
);

create type public.contact_status as enum (
  'new',
  'contacted',
  'qualified',
  'booked',
  'customer',
  'lost'
);

create type public.booking_status as enum (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.client_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  industry text,
  timezone text not null default 'America/New_York',
  portal_enabled boolean not null default true,
  booking_enabled boolean not null default true,
  facebook_page_id text,
  meta_ad_account_id text,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_account_id uuid references public.client_accounts (id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create unique index memberships_agency_unique
  on public.memberships (user_id, organization_id)
  where client_account_id is null;

create unique index memberships_client_unique
  on public.memberships (user_id, client_account_id)
  where client_account_id is not null;

create table public.account_secrets (
  client_account_id uuid primary key references public.client_accounts (id) on delete cascade,
  meta_page_access_token text,
  updated_at timestamptz not null default now()
);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null default 'Sales pipeline',
  created_at timestamptz not null default now()
);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines (id) on delete cascade,
  name text not null,
  position int not null,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  source text not null default 'manual',
  source_detail jsonb not null default '{}'::jsonb,
  status public.contact_status not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create index contacts_account_created_idx
  on public.contacts (client_account_id, created_at desc);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  pipeline_id uuid references public.pipelines (id) on delete set null,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  title text not null,
  value_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null default 'Main calendar',
  duration_minutes integer not null default 30,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  calendar_id uuid references public.calendars (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'scheduled',
  source text not null default 'booking_page',
  created_at timestamptz not null default now()
);

create index bookings_account_starts_idx
  on public.bookings (client_account_id, starts_at desc);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  payload jsonb not null,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);

-- Auth profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Default pipeline + calendar for each client account
create or replace function public.handle_new_client_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pipeline_id uuid;
begin
  insert into public.pipelines (client_account_id, name)
  values (new.id, 'Sales pipeline')
  returning id into pipeline_id;

  insert into public.pipeline_stages (pipeline_id, name, position) values
    (pipeline_id, 'New lead', 0),
    (pipeline_id, 'Contacted', 1),
    (pipeline_id, 'Booked', 2),
    (pipeline_id, 'Won', 3);

  insert into public.calendars (client_account_id, name, duration_minutes)
  values (new.id, 'Appointments', 30);

  insert into public.account_secrets (client_account_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_client_account_created on public.client_accounts;
create trigger on_client_account_created
  after insert on public.client_accounts
  for each row execute function public.handle_new_client_account();

create or replace function public.is_agency_of(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.organization_id = org_id
      and m.client_account_id is null
      and m.role in ('agency_owner', 'agency_admin', 'agency_staff')
  );
$$;

create or replace function public.can_access_client_account(account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_accounts a
    where a.id = account_id
      and (
        public.is_agency_of(a.organization_id)
        or exists (
          select 1
          from public.memberships m
          where m.user_id = auth.uid()
            and m.client_account_id = account_id
        )
      )
  );
$$;

create or replace function public.create_agency(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug)
  values (p_name, p_slug)
  returning id into org_id;

  insert into public.memberships (user_id, organization_id, role)
  values (auth.uid(), org_id, 'agency_owner');

  update public.profiles
  set organization_id = org_id
  where id = auth.uid();

  return org_id;
end;
$$;

grant execute on function public.create_agency(text, text) to authenticated;
grant execute on function public.is_agency_of(uuid) to authenticated;
grant execute on function public.can_access_client_account(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.client_accounts enable row level security;
alter table public.memberships enable row level security;
alter table public.account_secrets enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.calendars enable row level security;
alter table public.bookings enable row level security;
alter table public.webhook_events enable row level security;

create policy "profiles_self"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid());

create policy "orgs_members_read"
  on public.organizations for select
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
    )
  );

create policy "memberships_own"
  on public.memberships for select
  using (
    user_id = auth.uid()
    or public.is_agency_of(organization_id)
  );

create policy "accounts_access"
  on public.client_accounts for select
  using (public.can_access_client_account(id));

create policy "accounts_agency_write"
  on public.client_accounts for all
  using (public.is_agency_of(organization_id))
  with check (public.is_agency_of(organization_id));

create policy "pipelines_access"
  on public.pipelines for select
  using (public.can_access_client_account(client_account_id));

create policy "stages_access"
  on public.pipeline_stages for select
  using (
    exists (
      select 1 from public.pipelines p
      where p.id = pipeline_stages.pipeline_id
        and public.can_access_client_account(p.client_account_id)
    )
  );

create policy "contacts_read"
  on public.contacts for select
  using (public.can_access_client_account(client_account_id));

create policy "contacts_write"
  on public.contacts for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));

create policy "opps_read"
  on public.opportunities for select
  using (public.can_access_client_account(client_account_id));

create policy "opps_write"
  on public.opportunities for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));

create policy "calendars_read"
  on public.calendars for select
  using (public.can_access_client_account(client_account_id));

create policy "bookings_read"
  on public.bookings for select
  using (public.can_access_client_account(client_account_id));

create policy "bookings_write"
  on public.bookings for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));

-- Public booking inserts go through the service role.
-- account_secrets and webhook_events: no policies (service role only).
