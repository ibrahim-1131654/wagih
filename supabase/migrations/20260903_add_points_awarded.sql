-- إصلاح للجداول الموجودة مسبقًا: لا يحذف أي بيانات.
alter table public.quiz_answers
  add column if not exists points_awarded numeric not null default 0;
