# 배포 가이드 (보스님 전용)

## 준비: 깃허브 계정과 이메일
- 이메일: dlckals12@naver.com (보스님 계정으로 Netlify/Render 가입)

## 1) 깃허브 레포 생성
- 새 레포지토리를 만들고, 이 폴더 전체를 업로드합니다.

## 2) 백엔드(Render) 배포
- https://render.com → New → Web Service → GitHub 레포 선택
- Root/Directory를 `server` 로 지정
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - FRONTEND_ORIGIN: Netlify 도메인(예: https://shinhanlife-yosep.netlify.app)
  - (선택) SMTP_* / NOTIFY_TO 로 예약 알림 메일 설정
- 배포 완료 후 API URL 확인(예: https://shinhanlife-api.onrender.com)

## 3) 프론트엔드(Netlify) 배포
- https://app.netlify.com → Add new site → Import an existing project → 같은 GitHub 레포 선택
- Publish directory: `frontend`
- Build command: (비워둠)
- Environment Variables:
  - BACKEND_URL = (위 Render API URL 입력)
- 배포 완료 후 Netlify 사이트 주소 확인

## 4) 연결 테스트
- Netlify 주소 접속 → 상담 예약/후기 작성 → 정상 저장 시 성공
- Render 로그에서 /api/reservations 호출 확인 가능

## 5) 커스터마이징
- 프로필 사진 교체: `frontend/assets/profile.jpg` 파일을 보스님 사진으로 덮어쓰기
- 챗봇 답변: `frontend/faq.js` 에 키워드/답변 추가
- 연락처/카톡ID: `index.html`의 하단 문의 섹션에서 변경 가능
