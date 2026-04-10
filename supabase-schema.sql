-- ============================================
-- 성경퀴즈 앱 - Supabase 데이터베이스 스키마
-- Supabase 대시보드 → SQL Editor에서 이 SQL을 실행하세요
-- ============================================

-- 1. 퀴즈 테이블
create table quizzes (
  id text primary key,
  title text not null,
  code text not null unique,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  settings jsonb not null default '{}',
  current_question int not null default 0,
  created_at timestamptz not null default now()
);

-- 코드로 빠르게 검색
create index idx_quizzes_code on quizzes (code);

-- 2. 문제 테이블
create table questions (
  id text primary key,
  quiz_id text not null references quizzes(id) on delete cascade,
  "order" int not null,
  verse_ref text not null,
  verse_text text not null,
  words jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index idx_questions_quiz on questions (quiz_id);

-- 3. 참가자 테이블
create table participants (
  id text primary key,
  quiz_id text not null references quizzes(id) on delete cascade,
  nickname text not null,
  score int not null default 0,
  combo int not null default 0,
  joined_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique(quiz_id, nickname)
);

create index idx_participants_quiz on participants (quiz_id);

-- 4. 답안 테이블
create table answers (
  id text primary key,
  participant_id text not null references participants(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  selected_order jsonb not null default '[]',
  is_correct boolean not null default false,
  time_taken int not null default 0,
  hints_used int not null default 0,
  points_earned int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_answers_participant on answers (participant_id);

-- 5. 주간 말씀 테이블
create table weekly_verses (
  id text primary key,
  verse_ref text not null,
  verse_text text not null,
  week_start date not null default current_date,
  created_at timestamptz not null default now()
);

-- 6. 주간 퀴즈 시도 테이블
create table weekly_attempts (
  id text primary key,
  weekly_verse_id text not null references weekly_verses(id) on delete cascade,
  nickname text not null,
  is_correct boolean not null default false,
  time_taken int not null default 0,
  points_earned int not null default 0,
  attempted_at timestamptz not null default now()
);

-- ============================================
-- Row Level Security (RLS) - 모든 사용자 접근 허용
-- 인증 없이 코드+닉네임 방식이므로 전체 공개
-- ============================================

alter table quizzes enable row level security;
alter table questions enable row level security;
alter table participants enable row level security;
alter table answers enable row level security;
alter table weekly_verses enable row level security;
alter table weekly_attempts enable row level security;

-- 모든 테이블에 대해 anon 사용자 전체 접근 허용
create policy "quizzes_all" on quizzes for all using (true) with check (true);
create policy "questions_all" on questions for all using (true) with check (true);
create policy "participants_all" on participants for all using (true) with check (true);
create policy "answers_all" on answers for all using (true) with check (true);
create policy "weekly_verses_all" on weekly_verses for all using (true) with check (true);
create policy "weekly_attempts_all" on weekly_attempts for all using (true) with check (true);

-- ============================================
-- Realtime 활성화 (대기실, 게임 진행 실시간 동기화)
-- ============================================

alter publication supabase_realtime add table quizzes;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table answers;
