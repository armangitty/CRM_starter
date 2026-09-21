-- Profiles stay linked to auth.users and hold only non-sensitive fields.
-- Users may update their own full_name. Passwords remain in Supabase Auth.

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

revoke all on table public.profiles from anon;
revoke update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;
