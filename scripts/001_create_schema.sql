-- Student Case Management System Database Schema
-- Version 1.0

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('student', 'staff', 'admin');
create type case_type as enum ('academic', 'financial', 'conduct', 'support', 'administrative');
create type case_status as enum ('open', 'in_progress', 'pending_review', 'resolved', 'closed');
create type case_priority as enum ('low', 'medium', 'high', 'urgent');

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  role user_role not null default 'student',
  department text,
  student_id text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cases table
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null,
  title text not null,
  description text not null,
  type case_type not null,
  status case_status not null default 'open',
  priority case_priority not null default 'medium',
  created_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case comments table
create table if not exists public.case_comments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case documents table
create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size integer not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

-- Case history table (audit trail)
create table if not exists public.case_history (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists idx_cases_created_by on public.cases(created_by);
create index if not exists idx_cases_assigned_to on public.cases(assigned_to);
create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_cases_type on public.cases(type);
create index if not exists idx_cases_priority on public.cases(priority);
create index if not exists idx_cases_created_at on public.cases(created_at desc);
create index if not exists idx_case_comments_case_id on public.case_comments(case_id);
create index if not exists idx_case_documents_case_id on public.case_documents(case_id);
create index if not exists idx_case_history_case_id on public.case_history(case_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_comments enable row level security;
alter table public.case_documents enable row level security;
alter table public.case_history enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- RLS Policies for cases
create policy "Students can view own cases" on public.cases
  for select using (
    created_by = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

create policy "Students can create cases" on public.cases
  for insert with check (created_by = auth.uid());

create policy "Staff and admins can update cases" on public.cases
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    ) or created_by = auth.uid()
  );

create policy "Admins can delete cases" on public.cases
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for case_comments
create policy "Users can view comments on accessible cases" on public.case_comments
  for select using (
    exists (
      select 1 from public.cases c
      where c.id = case_id and (
        c.created_by = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role in ('staff', 'admin')
        )
      )
    ) and (
      is_internal = false or
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('staff', 'admin')
      )
    )
  );

create policy "Users can create comments on accessible cases" on public.case_comments
  for insert with check (
    author_id = auth.uid() and
    exists (
      select 1 from public.cases c
      where c.id = case_id and (
        c.created_by = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role in ('staff', 'admin')
        )
      )
    )
  );

create policy "Users can update own comments" on public.case_comments
  for update using (author_id = auth.uid());

create policy "Admins can delete any comment" on public.case_comments
  for delete using (
    author_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for case_documents
create policy "Users can view documents on accessible cases" on public.case_documents
  for select using (
    exists (
      select 1 from public.cases c
      where c.id = case_id and (
        c.created_by = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role in ('staff', 'admin')
        )
      )
    )
  );

create policy "Users can upload documents to accessible cases" on public.case_documents
  for insert with check (
    uploaded_by = auth.uid() and
    exists (
      select 1 from public.cases c
      where c.id = case_id and (
        c.created_by = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role in ('staff', 'admin')
        )
      )
    )
  );

create policy "Admins can delete documents" on public.case_documents
  for delete using (
    uploaded_by = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for case_history
create policy "Users can view history of accessible cases" on public.case_history
  for select using (
    exists (
      select 1 from public.cases c
      where c.id = case_id and (
        c.created_by = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role in ('staff', 'admin')
        )
      )
    )
  );

create policy "System can insert history" on public.case_history
  for insert with check (user_id = auth.uid());

-- RLS Policies for notifications
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "System can create notifications" on public.notifications
  for insert with check (true);

create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

create policy "Users can delete own notifications" on public.notifications
  for delete using (user_id = auth.uid());

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to generate case number
create or replace function public.generate_case_number()
returns trigger
language plpgsql
as $$
declare
  year_part text;
  seq_num integer;
begin
  year_part := to_char(now(), 'YYYY');
  select coalesce(max(cast(substring(case_number from 6) as integer)), 0) + 1
  into seq_num
  from public.cases
  where case_number like 'CASE' || year_part || '%';
  
  new.case_number := 'CASE' || year_part || lpad(seq_num::text, 5, '0');
  return new;
end;
$$;

-- Trigger to auto-generate case number
drop trigger if exists generate_case_number_trigger on public.cases;
create trigger generate_case_number_trigger
  before insert on public.cases
  for each row
  execute function public.generate_case_number();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Triggers for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

drop trigger if exists update_cases_updated_at on public.cases;
create trigger update_cases_updated_at
  before update on public.cases
  for each row
  execute function public.update_updated_at();

drop trigger if exists update_case_comments_updated_at on public.case_comments;
create trigger update_case_comments_updated_at
  before update on public.case_comments
  for each row
  execute function public.update_updated_at();
