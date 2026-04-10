# 성경퀴즈 앱 - 무료 배포 가이드

## 비용: 영구 0원

| 서비스 | 무료 한도 | 비용 |
|--------|-----------|------|
| Vercel (호스팅) | 월 100GB 트래픽 | 0원 |
| Supabase (DB) | 500MB, 월 5만 사용자 | 0원 |
| 합계 | | **0원** |

---

## 1단계: GitHub에 코드 올리기

```bash
cd bible-quiz
git init
git add .
git commit -m "init: 성경퀴즈 앱"
```

GitHub에서 새 저장소 생성 후:
```bash
git remote add origin https://github.com/YOUR_USERNAME/bible-quiz.git
git push -u origin main
```

---

## 2단계: Supabase 설정

### 2-1. 프로젝트 생성
1. https://supabase.com 접속
2. **GitHub 계정**으로 가입 (카드 등록 불필요)
3. **New Project** 클릭
   - Name: `bible-quiz`
   - Region: `Northeast Asia (Seoul)` 또는 가장 가까운 지역
   - Password: 아무거나 입력 (DB 비밀번호)
4. 프로젝트 생성까지 약 2분 대기

### 2-2. 테이블 생성
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase-schema.sql` 파일의 내용을 전체 복사하여 붙여넣기
4. **Run** 버튼 클릭
5. "Success" 메시지 확인

### 2-3. API 키 확인
1. 왼쪽 메뉴에서 **Settings** → **API** 클릭
2. 두 값을 메모장에 복사:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public** 키: `eyJhbG...` (긴 문자열)

---

## 3단계: Vercel 배포

### 3-1. Vercel 가입 + 연결
1. https://vercel.com 접속
2. **GitHub 계정**으로 가입 (카드 등록 불필요)
3. **Add New → Project** 클릭
4. GitHub에서 `bible-quiz` 저장소 선택
5. **Import** 클릭

### 3-2. 환경 변수 설정
배포 설정 화면에서 **Environment Variables** 섹션에 추가:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public 키 |

### 3-3. 배포
1. **Deploy** 버튼 클릭
2. 약 1-2분 후 배포 완료
3. `https://bible-quiz-xxxx.vercel.app` 주소가 생성됨

---

## 4단계: 사용하기

### 선생님
1. 배포된 URL 접속
2. **선생님** 버튼 클릭
3. 퀴즈 만들기 → 성경 구절 입력 → 참가 코드 발급

### 학생
1. 선생님이 알려준 참가 코드 또는 QR코드로 접속
2. 닉네임 입력 → 게임 참가

---

## 문제 해결

### "퀴즈를 찾을 수 없어요" 오류
- Supabase 환경 변수가 올바르게 설정되었는지 확인
- Vercel 대시보드 → Settings → Environment Variables 확인

### 배포 후 에러
- Vercel 대시보드 → Deployments → 최신 배포 → Logs 확인

### 코드 수정 후 재배포
- GitHub에 push하면 Vercel이 자동으로 재배포합니다
```bash
git add .
git commit -m "fix: 수정 내용"
git push
```
