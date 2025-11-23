# WediFit - AI Wedding Planner

웨딩 준비를 위한 AI 기반 웨딩 플래너 애플리케이션입니다.

## 주요 기능

- **랜딩 페이지**: 서비스 소개 및 시작
- **홈**: 추천 업체 및 무드 테스트 결과 표시
- **무드 테스트**: AI 기반 웨딩 스타일 테스트
- **가상 피팅**: 웨딩드레스 가상 피팅
- **일정 관리**: 웨딩 준비 일정 및 체크리스트
- **계약서**: 업체별 계약서 관리
- **채팅**: AI 웨딩 플래너 챗봇

## 기술 스택

- **Frontend**: React 19.2, TypeScript
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React
- **AI**: Google Gemini API

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

현재 환경 변수 설정이 필요하지 않습니다. 애플리케이션은 더미 데이터를 사용하여 작동합니다.

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

## 배포

이 프로젝트는 Netlify에 배포되도록 구성되어 있습니다.

### Netlify 배포 설정

1. Netlify에 로그인
2. 새 사이트 추가 (GitHub 저장소 연결)
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 환경 변수 설정:
   - 현재 환경 변수 설정이 필요하지 않습니다.

## 프로젝트 구조

```
wedi-fit-fe/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # API 서비스
│   ├── App.tsx         # 메인 앱 컴포넌트
│   ├── main.tsx        # 엔트리 포인트
│   ├── types.ts        # TypeScript 타입 정의
│   ├── constants.ts    # 상수 및 목업 데이터
│   └── index.css       # 글로벌 스타일
├── public/             # 정적 파일
├── dist/               # 빌드 결과물
└── index.html          # HTML 템플릿
```

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
