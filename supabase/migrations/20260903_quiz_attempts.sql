-- شغّل هذا الملف مرة واحدة من Supabase SQL Editor.
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  score numeric not null default 0,
  total_points numeric not null default 0,
  submitted_at timestamptz not null default now()
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_id uuid references public.quiz_options(id),
  is_correct boolean not null,
  points_awarded numeric not null default 0,
  unique (attempt_id, question_id)
);

alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;

create policy "Students can read their attempts" on public.quiz_attempts for select to authenticated using (student_id = auth.uid());
create policy "Students can read their answers" on public.quiz_answers for select to authenticated using (
  exists (select 1 from public.quiz_attempts where id = attempt_id and student_id = auth.uid())
);

create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt_id uuid;
  v_score numeric := 0;
  v_total_points numeric := 0;
  v_question record;
  v_selected_option_id uuid;
  v_is_correct boolean;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  if not exists (
    select 1 from quizzes q join course_subscriptions s on s.course_id = q.course_id
    where q.id = p_quiz_id and q.is_published = true and s.student_id = auth.uid() and s.status = 'active'
  ) then raise exception 'ليس لديك صلاحية لأداء هذا الاختبار'; end if;

  insert into quiz_attempts (quiz_id, student_id) values (p_quiz_id, auth.uid()) returning id into v_attempt_id;
  for v_question in select id, points from quiz_questions where quiz_id = p_quiz_id loop
    select nullif(answer->>'selected_option_id', '')::uuid into v_selected_option_id
    from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) answer where answer->>'question_id' = v_question.id::text limit 1;
    select coalesce(is_correct, false) into v_is_correct from quiz_options where id = v_selected_option_id and question_id = v_question.id;
    v_is_correct := coalesce(v_is_correct, false);
    insert into quiz_answers (attempt_id, question_id, selected_option_id, is_correct, points_awarded)
    values (v_attempt_id, v_question.id, v_selected_option_id, v_is_correct, case when v_is_correct then v_question.points else 0 end);
    v_total_points := v_total_points + v_question.points;
    if v_is_correct then v_score := v_score + v_question.points; end if;
  end loop;
  update quiz_attempts set score = v_score, total_points = v_total_points where id = v_attempt_id;
  return v_attempt_id;
end;
$$;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
