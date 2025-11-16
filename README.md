# WediFit Frontend - 웨딩드레스 시착 서비스 프론트엔드

WediFit 프론트엔드는 React와 TypeScript로 구성된 웨딩드레스 AI 시착 서비스의 클라이언트 애플리케이션입니다.

## 🏗️ 프로젝트 구조

```
wedi-fit-fe/
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── DressSelector.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ResultGallery.tsx
│   │   └── ui/            # shadcn/ui 컴포넌트
│   ├── App.tsx            # 메인 애플리케이션
│   ├── main.tsx           # 진입점
│   └── styles/            # 스타일 파일
├── dist/                   # 빌드 결과물
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5174`에서 실행됩니다.

**중요**: 백엔드 서버(`wedi-fit-be`)가 `http://localhost:3001`에서 실행 중이어야 합니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 🐳 Docker로 실행

### Docker Compose 사용

```bash
# 컨테이너 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f web
```

웹 애플리케이션은 `http://localhost:8081`에서 접근 가능합니다.

### Docker 직접 실행

```bash
# 이미지 빌드
docker build -t wedi-fit-web .

# 컨테이너 실행
docker run -p 8081:8080 wedi-fit-web
```

## ⚙️ 환경 설정

### 백엔드 연결 설정

프론트엔드는 `wedi-fit-be` 백엔드 서버와 통신합니다. 백엔드 서버가 실행 중이어야 합니다.

**백엔드 서버 실행 방법:**
```bash
cd ../wedi-fit-be
docker-compose up -d
```

### API URL 설정

백엔드 API URL은 환경 변수로 설정할 수 있습니다:

**1. `.env` 파일 생성** (프로젝트 루트에)
```bash
VITE_API_URL=http://localhost:3001
```

**2. 환경별 설정**
- **개발 환경**: `http://localhost:3001` (기본값)
- **프로덕션 환경**: 실제 백엔드 서버 URL

**참고**: 환경 변수가 설정되지 않은 경우 기본값(`http://localhost:3001`)이 사용됩니다.

### Vite 프록시 설정

개발 서버에서 `/api`로 시작하는 요청은 자동으로 백엔드로 프록시됩니다.
`vite.config.ts`에서 프록시 설정을 확인할 수 있습니다.

## 🛠️ 기술 스택

- **프레임워크**: React 18
- **언어**: TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **이미지 처리**: HTML5 Canvas API

## 📦 주요 기능

- 사용자 사진 업로드
- 웨딩드레스 선택 (다중 선택 지원)
- AI 이미지 합성 요청
- 합성 결과 갤러리 표시
- 반응형 디자인

## 🔧 개발

### 개발 모드

```bash
npm run dev
```

### 타입 체크

```bash
npm run type-check
```

### 린트

```bash
npm run lint
```

## 📝 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 결과물 미리보기
- `npm run lint` - ESLint 실행

## 🌐 접속 정보

- **프론트엔드 (로컬 개발)**: http://localhost:5174
- **프론트엔드 (Docker)**: http://localhost:8081
- **백엔드 API**: http://localhost:3001
- **백엔드 API 문서**: http://localhost:3001/docs

## 🚀 Netlify 배포

### 빠른 배포 가이드

자세한 배포 가이드는 [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md)를 참조하세요.

**주요 단계:**

1. **Netlify에 프로젝트 연결**
   - Netlify 대시보드에서 Git 저장소 연결
   - 빌드 설정: `npm run build`
   - 출력 디렉토리: `dist`

2. **환경 변수 설정**
   ```
   VITE_API_URL=https://api.wedifit.me
   ```

3. **도메인 연결**
   - `wedifit.me` 도메인 추가
   - DNS 설정 완료

### 배포 전 확인사항

- [ ] `npm run build`가 로컬에서 성공적으로 실행됨
- [ ] 환경 변수 `VITE_API_URL`이 설정됨
- [ ] 백엔드 서버가 실행 중이고 CORS 설정 완료됨
- [ ] `netlify.toml` 파일이 프로젝트 루트에 있음

## 📚 관련 프로젝트

- **백엔드**: [wedi-fit-be](../wedi-fit-be/) - FastAPI 백엔드 서버

