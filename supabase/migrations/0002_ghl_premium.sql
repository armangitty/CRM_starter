-- GHL Unlimited-style CRM modules

alter table public.organizations
  add column if not exists logo_url text,
  add column if not exists brand_color text not null default '#c4a574',
  add column if not exists custom_domain text,
  add column if not exists support_email text,
  add column if not exists white_label_enabled boolean not null default false;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  color text not null default '#c4a574',
  unique (client_account_id, name)
);

create table if not exists public.contact_tags (
  contact_id uuid not null references public.contacts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (contact_id, tag_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  title text not null,
  due_at timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  channel text not null default 'sms',
  subject text,
  last_message_at timestamptz not null default now(),
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  channel text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  slug text not null,
  schema jsonb not null default '[{"name":"first_name","label":"First name","type":"text"},{"name":"last_name","label":"Last name","type":"text"},{"name":"email","label":"Email","type":"email"},{"name":"phone","label":"Phone","type":"tel"}]'::jsonb,
  created_at timestamptz not null default now(),
  unique (client_account_id, slug)
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.funnel_pages (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  slug text not null,
  headline text not null default 'Book a call',
  body text not null default 'Tell us about your project and we will get you on the calendar.',
  cta_label text not null default 'Get started',
  cta_href text,
  published boolean not null default true,
  unique (client_account_id, slug)
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  trigger text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  position int not null,
  action text not null,
  config jsonb not null default '{}'::jsonb
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  contact_id uuid,
  status text not null default 'completed',
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  name text not null,
  subject text,
  body text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  author text not null,
  rating int not null check (rating between 1 and 5),
  body text,
  source text not null default 'google',
  replied boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  amount_cents int not null default 0,
  interval text not null default 'one_time'
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  amount_cents int not null default 0,
  status text not null default 'draft',
  due_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts (id) on delete cascade,
  name text not null,
  amount_cents int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_subscribers (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.membership_plans (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_account_id uuid references public.client_accounts (id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists integration_org_provider
  on public.integration_connections (organization_id, provider)
  where client_account_id is null;

create unique index if not exists integration_account_provider
  on public.integration_connections (client_account_id, provider)
  where client_account_id is not null;

create table if not exists public.integration_secrets (
  connection_id uuid primary key references public.integration_connections (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tags enable row level security;
alter table public.contact_tags enable row level security;
alter table public.tasks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;
alter table public.funnel_pages enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_sends enable row level security;
alter table public.reviews enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.membership_plans enable row level security;
alter table public.membership_subscribers enable row level security;
alter table public.integration_connections enable row level security;
alter table public.integration_secrets enable row level security;

create policy "tags_access" on public.tags for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "contact_tags_access" on public.contact_tags for all
  using (exists (select 1 from public.contacts c where c.id = contact_id and public.can_access_client_account(c.client_account_id)))
  with check (exists (select 1 from public.contacts c where c.id = contact_id and public.can_access_client_account(c.client_account_id)));
create policy "tasks_access" on public.tasks for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "conversations_access" on public.conversations for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "messages_access" on public.messages for all
  using (exists (select 1 from public.conversations c where c.id = conversation_id and public.can_access_client_account(c.client_account_id)))
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and public.can_access_client_account(c.client_account_id)));
create policy "forms_access" on public.forms for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "form_submissions_access" on public.form_submissions for all
  using (exists (select 1 from public.forms f where f.id = form_id and public.can_access_client_account(f.client_account_id)))
  with check (exists (select 1 from public.forms f where f.id = form_id and public.can_access_client_account(f.client_account_id)));
create policy "funnels_access" on public.funnel_pages for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "workflows_access" on public.workflows for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "workflow_steps_access" on public.workflow_steps for all
  using (exists (select 1 from public.workflows w where w.id = workflow_id and public.can_access_client_account(w.client_account_id)))
  with check (exists (select 1 from public.workflows w where w.id = workflow_id and public.can_access_client_account(w.client_account_id)));
create policy "workflow_runs_access" on public.workflow_runs for select
  using (exists (select 1 from public.workflows w where w.id = workflow_id and public.can_access_client_account(w.client_account_id)));
create policy "campaigns_access" on public.campaigns for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "campaign_sends_access" on public.campaign_sends for all
  using (exists (select 1 from public.campaigns c where c.id = campaign_id and public.can_access_client_account(c.client_account_id)))
  with check (exists (select 1 from public.campaigns c where c.id = campaign_id and public.can_access_client_account(c.client_account_id)));
create policy "reviews_access" on public.reviews for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "products_access" on public.products for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "invoices_access" on public.invoices for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "membership_plans_access" on public.membership_plans for all
  using (public.can_access_client_account(client_account_id))
  with check (public.can_access_client_account(client_account_id));
create policy "membership_subs_access" on public.membership_subscribers for all
  using (exists (select 1 from public.membership_plans p where p.id = plan_id and public.can_access_client_account(p.client_account_id)))
  with check (exists (select 1 from public.membership_plans p where p.id = plan_id and public.can_access_client_account(p.client_account_id)));
create policy "integrations_access" on public.integration_connections for select
  using (
    public.is_agency_of(organization_id)
    or (client_account_id is not null and public.can_access_client_account(client_account_id))
  );
create policy "integrations_agency_write" on public.integration_connections for all
  using (public.is_agency_of(organization_id))
  with check (public.is_agency_of(organization_id));

drop trigger if exists on_client_account_created on public.client_accounts;

create or replace function public.handle_new_client_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pipeline_id uuid;
  workflow_id uuid;
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
  values (new.id)
  on conflict do nothing;

  insert into public.forms (client_account_id, name, slug)
  values (new.id, 'Lead capture', 'lead-capture')
  on conflict do nothing;

  insert into public.funnel_pages (client_account_id, name, slug, headline, body, cta_href)
  values (
    new.id, 'Offer page', 'offer', 'Ready to grow?',
    'Send Facebook and Google traffic here. CTA opens your booking page.',
    '/book/' || new.slug
  )
  on conflict do nothing;

  insert into public.tags (client_account_id, name, color)
  values (new.id, 'New lead', '#c4a574')
  on conflict do nothing;

  insert into public.workflows (client_account_id, name, trigger, enabled)
  values (new.id, 'New lead nurture', 'contact_created', true)
  returning id into workflow_id;

  insert into public.workflow_steps (workflow_id, position, action, config) values
    (workflow_id, 0, 'add_tag', '{"tag":"New lead"}'::jsonb),
    (workflow_id, 1, 'create_task', '{"title":"Speed-to-lead: call now"}'::jsonb),
    (workflow_id, 2, 'send_sms', '{"body":"Thanks for your inquiry — reply BOOK to grab a time."}'::jsonb),
    (workflow_id, 3, 'send_email', '{"subject":"We received your request","body":"A specialist will follow up shortly."}'::jsonb);

  return new;
end;
$$;

create trigger on_client_account_created
  after insert on public.client_accounts
  for each row execute function public.handle_new_client_account();

insert into public.forms (client_account_id, name, slug)
select a.id, 'Lead capture', 'lead-capture'
from public.client_accounts a
where not exists (
  select 1 from public.forms f where f.client_account_id = a.id
);

insert into public.funnel_pages (client_account_id, name, slug, headline, body, cta_href)
select a.id, 'Offer page', 'offer', 'Ready to grow?',
  'Send Facebook and Google traffic here. CTA opens your booking page.',
  '/book/' || a.slug
from public.client_accounts a
where not exists (
  select 1 from public.funnel_pages p where p.client_account_id = a.id
);

insert into public.tags (client_account_id, name, color)
select a.id, 'New lead', '#c4a574'
from public.client_accounts a
where not exists (
  select 1 from public.tags t where t.client_account_id = a.id
);
