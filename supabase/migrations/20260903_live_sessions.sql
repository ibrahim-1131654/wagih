-- شغّل هذا الملف مرة واحدة من Supabase SQL Editor.
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  youtube_url text not null,
  starts_at timestamptz not null default now(),
  is_live boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.live_sessions enable row level security;

create policy "Admins manage live sessions" on public.live_sessions for all to authenticated
using ((select role from public.profiles where id = auth.uid()) = 'admin')
with check ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Students can view their live sessions" on public.live_sessions for select to authenticated
using (
  is_live = true and (
    course_id is null or exists (
      select 1 from public.course_subscriptions
      where course_id = live_sessions.course_id and student_id = auth.uid() and status = 'active'
    )
  )
);
