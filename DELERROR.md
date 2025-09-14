
# API 인증 오류 디버깅 및 인수인계 문서 (DELERROR.md)

## 최종 요약 (Final Summary)

- **문제 (Problem):** 관리자 페이지에 비밀번호로 로그인하는 것 자체는 성공하지만, 로그인 후 안전보건용품 추가/삭제 등 API를 사용하는 모든 기능이 `401 Unauthorized` 오류를 반환하며 실패함. Google 로그인 또한 최종 단계에서 `401` 오류가 발생.
- **현재 상태 (Current Status):** 로컬 개발 환경(`localhost:3000`)에서는 모든 기능(비밀번호 로그인, 상품 관리, Google 로그인)이 완벽하게 정상 작동함. 하지만 Vercel 프로덕션 환경(`https://korean-safety-chatbot.vercel.app`)에 배포했을 때만 문제가 발생.
- **핵심 원인 (Suspected Root Cause):** Vercel의 미들웨어 실행 환경(Edge Runtime)에서, 브라우저가 정상적으로 보내주는 `admin-token` 쿠키의 JWT(JSON Web Token)를 올바르게 검증하지 못하고 있음. `jsonwebtoken`과 `jose` 라이브러리를 모두 사용해 봤으나 인증이 계속 실패하여, Vercel 플랫폼과 인증 라이브러리 간의 미묘한 호환성 문제 또는 환경 변수(`JWT_SECRET`) 전달 문제로 강력히 의심됨.

---

## 지금까지의 디버깅 과정 (Debugging Process So Far)

#### 1. 초기 문제: Google 로그인 버튼 비활성화 및 비밀번호 오류
- **진단:** `app/admin/page.tsx`에 버튼이 하드코딩으로 비활성화되어 있었고, 비밀번호는 `.env.local` 파일의 `ADMIN_PASSWORD` 환경 변수로 제어되고 있었음.
- **조치:**
    1. `app/admin/page.tsx`의 `disabled` 속성 제거.
    2. `.env.local` 파일에 `ADMIN_PASSWORD=7930`을 명시적으로 작성.
- **결과:** 로컬 환경에서 문제가 해결됨.

#### 2. Vercel 배포 후 문제: 비밀번호 로그인 실패 (401)
- **진단:** 로컬의 `.env.local` 파일은 Vercel에 배포되지 않음. Vercel 프로젝트 설정에 `ADMIN_PASSWORD` 환경 변수가 없거나 잘못 설정되어 있었음.
- **조치:** Vercel 대시보드에서 `ADMIN_PASSWORD` 환경 변수를 `7930`으로 설정하도록 안내.
- **결과:** 비밀번호 로그인은 성공하게 됨.

#### 3. 로그인 성공 후 문제: 관리자 페이지 깜빡임 (튕김 현상)
- **진단:** `app/api/auth/status/route.ts` (인증 상태 확인 API)가 비밀번호 로그인(`admin-token`)을 확인하지 않고 Google 로그인(`google_token`)만 확인하는 버그 발견.
- **조치:** `status` API가 `admin-token`도 검증하도록 코드 수정.
- **결과:** 로그인 후 튕김 현상 해결.

#### 4. Google 로그인 `400` 오류
- **진단:** `lib/google-drive.ts` 코드에 `redirect_uri`가 `korean-safety-chatbot-app.vercel.app`으로 잘못 하드코딩되어 있었음. 실제 주소는 `-app`이 빠진 `korean-safety-chatbot.vercel.app` 이어야 했음.
- **조치:** 코드 내의 모든 잘못된 `redirect_uri`를 올바른 주소로 수정.
- **결과:** `400` 오류는 해결되었으나, 이후 `401` 오류가 발생.

#### 5. 현재 문제: 상품 추가/삭제 시 `401` 오류 발생
- **진단:** 모든 관리자 API 요청을 가로채는 `middleware.ts`에 `status` API와 동일한 버그(비밀번호 토큰 미확인)가 있음을 발견.
- **1차 조치:** `middleware.ts`가 `admin-token`을 확인하도록 `jsonwebtoken` 라이브러리로 로직 추가 후 배포.
- **결과:** **실패.** 여전히 `401` 오류 발생.
- **2차 조치 (가설: 라이브러리 호환성 문제):** `jsonwebtoken`이 Vercel Edge 환경과 호환되지 않을 수 있다는 가설 수립. Edge 환경과 호환성이 좋은 `jose` 라이브러리를 사용하도록 `middleware.ts` 전체 코드 교체 후 배포.
- **최종 결과:** **실패.** 여전히 `401` 오류 발생. 브라우저가 `admin-token` 쿠키를 정상적으로 보내고 있음에도 서버 미들웨어에서 인증이 계속 실패함. (이것이 현재 상태)

---

## 전달 사항 및 추천 다음 단계 (Handoff Notes & Recommended Next Steps)

- **핵심 파일 (Relevant Files):**
    - `middleware.ts`: **가장 핵심적인 문제 파일.** 현재 `jose` 라이브러리를 사용하도록 최종 수정된 상태.
    - `lib/google-drive.ts`: Google 로그인 `redirect_uri` 관련 로직 포함.
    - `app/api/auth/login/route.ts`: 비밀번호 로그인 및 `admin-token` 생성 로직.
    - `package.json`: `jose`와 `jsonwebtoken` 라이브러리 버전 확인용.

- **Claude Code에게 추천하는 다음 단계:**

    1.  **미들웨어 비활성화 테스트 (가장 먼저 시도할 것):**
        - `middleware.ts` 파일 하단의 `config` 객체에서 `matcher` 배열을 일시적으로 비워두고 배포 (`matcher: []`).
        - 이렇게 하면 모든 요청이 미들웨어를 통과하지 않게 됨.
        - 이 상태에서 API 요청(상품 삭제 등)이 성공하는지(물론 기능은 실패하겠지만 `401`이 아닌 다른 오류가 나는지) 확인.
        - 이를 통해 문제가 100% 미들웨어의 인증 로직에 있음을 확신할 수 있음. (테스트 후 즉시 롤백 필수)

    2.  **API 라우트 직접 인증으로 우회:**
        - 미들웨어 인증을 포기하고, 각 `api/admin/*` 폴더의 `route.ts` 파일마다 상단에 인증 로직(쿠키를 읽고 `jose`로 검증하는 미들웨어의 코드를 복사)을 직접 추가하는 방식으로 우회. 이 방식은 미들웨어 환경을 피할 수 있어 성공 확률이 높음.

    3.  **Vercel 지원팀 또는 커뮤니티 문의:**
        - 현재 상황은 코드의 명백한 문제라기보다는 Vercel 플랫폼의 특정 동작 방식과 관련되었을 가능성이 매우 높음.
        - Vercel 지원팀이나 관련 커뮤니티(Next.js 등)에 "Next.js 15.5.2 버전의 Middleware에서 `jose` 또는 `jsonwebtoken`을 사용한 JWT 검증이 실패하는 이유"에 대해 질문하는 것을 고려.
