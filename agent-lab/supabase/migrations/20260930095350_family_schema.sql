-- Agent Lab: families, profiles, synced progress, activity feed and chat.
-- Applied to the `agent-lab` Supabase project. Re-run on a fresh project to recreate the backend.

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  join_code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner' check (char_length(display_name) between 1 and 40),
  avatar_color text not null default 'violet',
  family_id uuid references public.families(id) on delete set null,
  created_at timestamptz not null default now()
);
create index profiles_family_idx on public.profiles(family_id);

-- Full state as JSON + summary columns for leaderboards
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  xp integer not null default 0,
  current_level integer not null default 1,
  levels_completed integer not null default 0,
  lessons_completed integer not null default 0,
  badges integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  kind text not null,
  label text not null check (char_length(label) <= 200),
  xp integer not null default 0,
  created_at timestamptz not null default now()
);
create index activity_family_idx on public.activity(family_id, created_at desc);

-- channel = 'family' for the family chat, 'lesson:<lessonId>' for lesson discussions
create table public.messages (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'family' check (char_length(channel) <= 80),
  body text not null check (char_length(body) between 1 and 2000),
  is_question boolean not null default false,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_family_channel_idx on public.messages(family_id, channel, created_at);

-- The caller's family (security definer avoids RLS recursion on profiles)
create or replace function public.my_family_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select family_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)));
  insert into public.progress (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.create_family(family_name text)
returns public.families language plpgsql security definer set search_path = '' as $$
declare
  f public.families;
  code text;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O, 1/I/L lookalikes
  bytes bytea;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  loop
    bytes := extensions.gen_random_bytes(6);
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.families where join_code = code);
  end loop;
  insert into public.families (name, join_code, created_by) values (trim(family_name), code, auth.uid()) returning * into f;
  update public.profiles set family_id = f.id where id = auth.uid();
  return f;
end $$;

create or replace function public.join_family(code text)
returns public.families language plpgsql security definer set search_path = '' as $$
declare f public.families;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into f from public.families where join_code = upper(trim(code));
  if f.id is null then raise exception 'No family found with that code'; end if;
  update public.profiles set family_id = f.id where id = auth.uid();
  return f;
end $$;

create or replace function public.leave_family()
returns void language sql security definer set search_path = '' as $$
  update public.profiles set family_id = null where id = auth.uid();
$$;

revoke execute on function public.create_family(text), public.join_family(text), public.leave_family(), public.my_family_id() from public, anon;
grant execute on function public.create_family(text), public.join_family(text), public.leave_family(), public.my_family_id() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Row level security ------------------------------------------------------------
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.activity enable row level security;
alter table public.messages enable row level security;

create policy "members see their family" on public.families for select to authenticated
  using (id = (select public.my_family_id()));

create policy "see self and family" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or family_id = (select public.my_family_id()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Only name and colour are editable directly; family changes go through the RPCs.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, avatar_color) on public.profiles to authenticated;

create policy "see own and family progress" on public.progress for select to authenticated
  using (user_id = (select auth.uid())
         or user_id in (select id from public.profiles where family_id = (select public.my_family_id())));
create policy "update own progress" on public.progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "insert own progress" on public.progress for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "family activity" on public.activity for select to authenticated
  using (family_id = (select public.my_family_id()));
create policy "log own activity" on public.activity for insert to authenticated
  with check (user_id = (select auth.uid()) and family_id = (select public.my_family_id()));

create policy "family messages" on public.messages for select to authenticated
  using (family_id = (select public.my_family_id()));
create policy "post as self" on public.messages for insert to authenticated
  with check (user_id = (select auth.uid()) and family_id = (select public.my_family_id()));
create policy "family can mark answered" on public.messages for update to authenticated
  using (family_id = (select public.my_family_id())) with check (family_id = (select public.my_family_id()));
create policy "delete own messages" on public.messages for delete to authenticated
  using (user_id = (select auth.uid()));
revoke update on public.messages from authenticated, anon;
grant update (answered) on public.messages to authenticated;

revoke all on public.families, public.profiles, public.progress, public.activity, public.messages from anon;

alter publication supabase_realtime add table public.messages, public.activity, public.progress, public.profiles;
