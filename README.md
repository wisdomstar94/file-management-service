# 파일 관리 서비스

파일을 업로드하고 외부 공유 링크를 만들고 버전 관리를 할 수 있는 기능을 제공합니다.

## 빠른 실행 (Docker)

Docker (Compose v2) 만 있으면 됩니다. Node · yarn 은 설치하지 않아도 됩니다.

```bash
git clone https://github.com/wisdomstar94/file-management-service.git
```

```bash
cd file-management-service
```

### 실행

#### macOS · Linux

```bash
JWT_SECRET="$(openssl rand -base64 48)" docker compose -p fms-quickstart -f dockers/compose.yml up -d --build
```

- `openssl` 이 없으면 `JWT_SECRET` 에 32자 이상의 아무 문자열을 넣어도 됩니다.

#### Windows (PowerShell)

```powershell
$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); $env:JWT_SECRET = [Convert]::ToBase64String($b)
```

```powershell
docker compose -p fms-quickstart -f dockers/compose.yml up -d --build
```

- Git Bash · WSL 에서는 macOS · Linux 명령을 그대로 쓰면 됩니다.
- `migrator` 가 `exit 2` 로 실패했다면 `git pull` 로 최신 코드를 받은 뒤 같은 명령으로 다시 실행하세요. 셸 스크립트 줄바꿈(CRLF) 문제로, 최신 코드에서 고쳐졌습니다.
- cmd 에서는 `set JWT_SECRET=<32자 이상 임의 문자열>` 을 먼저 실행한 뒤 같은 `docker compose` 명령을 씁니다.
- 새 창에서 다시 실행하면 새 `JWT_SECRET` 이 만들어져 기존 로그인이 풀립니다. 다시 로그인하면 됩니다.

#### 실행 후

- DB 마이그레이션과 최초 관리자 계정 생성은 컨테이너가 뜰 때 자동으로 실행됩니다.

| 화면 | 주소 | 비고 |
| --- | --- | --- |
| 관리자 웹 | http://localhost:3000 | 아이디 `admin` · 비밀번호 `admin1234!` |
| 공개 링크 웹 | `http://localhost:3001/s/<token>` | 관리자 웹에서 만든 외부 공개 링크로 열립니다 |
| API 상태 확인 | http://localhost:4000/api/health | `{"data":{"status":"ok"}}` |

### 둘러보기

1. 관리자 웹에 로그인합니다.
2. **자료 관리** 에서 **새 자료 등록** 으로 파일을 올리고, 자료 상세에서 **새 버전 등록** 으로 버전을 쌓아 봅니다.
3. 자료 상세에서 **외부 공개 링크 생성** 으로 링크를 만듭니다. 비밀번호 · 다운로드 기간 · 총 다운로드 허용 수 · 노출할 버전을 정할 수 있습니다.
4. **링크 복사** 로 받은 주소를 새 창에서 열어 공개 링크 웹에서 파일을 내려받습니다.
5. **관리자 계정 관리** · **권한 그룹 관리** · **접근 정책 그룹 관리** 에서 관리자별 권한과 IP · 요청 헤더 기반 접근 제한을 설정해 봅니다.

### 종료

#### macOS · Linux

```bash
JWT_SECRET=unused docker compose -p fms-quickstart -f dockers/compose.yml down      # 컨테이너만 정리 (데이터 유지)
JWT_SECRET=unused docker compose -p fms-quickstart -f dockers/compose.yml down -v   # 업로드 파일 · DB 데이터까지 삭제
```

#### Windows (PowerShell)

실행할 때 쓴 창에서 그대로 실행합니다.

```powershell
docker compose -p fms-quickstart -f dockers/compose.yml down      # 컨테이너만 정리 (데이터 유지)
docker compose -p fms-quickstart -f dockers/compose.yml down -v   # 업로드 파일 · DB 데이터까지 삭제
```

- `$env:JWT_SECRET` 은 그 PowerShell 창을 닫으면 사라집니다. 새 창에서 종료할 때는 `$env:JWT_SECRET = 'unused'` 를 먼저 실행하세요.

#### 종료 시 참고

- compose 파일이 `JWT_SECRET` 을 필수로 요구해 종료할 때도 값이 있어야 합니다. 종료에는 쓰이지 않으므로 아무 값이나 넣으면 됩니다.
- `-p fms-quickstart` 는 로컬 개발용 DB(`fms` 프로젝트)와 볼륨을 나누기 위한 옵션입니다. 실행과 종료에 같은 값을 넣어야 합니다.

## 구성

| 경로 | 설명 |
| --- | --- |
| `servers/api` | Express API (`/api/admin/**` 관리자, `/api/public/**` 외부 공개 링크) |
| `servers/database-manager` | TypeORM 마이그레이션 · 시드 CLI |
| `webs/file-management-service-admin` | 관리자 웹 (Next.js, 3000) |
| `webs/file-management-service-user` | 외부 공개 링크 웹 (Next.js, 3001, `/s/<token>`) |
| `libs/**` | 공용 패키지. vite 로 sub export 빌드 (`dist/<그룹>/<모듈>/index.{mjs,cjs,d.ts}`) |
| `dockers/` | Dockerfile(빌드 대상별) · compose (개발 · e2e) |

## 로컬 개발

```bash
cp .env.local-sample .env.local
yarn install
yarn libs:build
docker compose -f dockers/compose.postgres.yml up -d

yarn workspace @fms/database-manager build
yarn workspace @fms/database-manager setup     # 마이그레이션 + 시드(최초 관리자 계정 포함)

yarn workspace @fms/api dev
yarn workspace @fms/admin-web dev
yarn workspace @fms/user-web dev
```

- `libs/**` 를 고칠 때는 `yarn libs:watch` 를 함께 띄우면 모든 libs 패키지가 변경 시 다시 빌드됩니다. (최초 1회 `yarn libs:build` 가 먼저 필요)
- 최초 관리자 계정은 `.env.local` 의 `INITIAL_ADMIN_ID` · `INITIAL_ADMIN_PASSWORD` 로 만들어집니다.

## 마이그레이션

```bash
yarn workspace @fms/database-manager migration:generate src/migrations/<이름>   # 엔티티 변경 감지 → 마이그레이션 생성
yarn workspace @fms/database-manager build
yarn workspace @fms/database-manager migration:run
yarn workspace @fms/database-manager migration:revert
```

- 엔티티는 `libs/server-shared/database-entities` 에 있습니다. 엔티티를 고친 뒤 `yarn libs:build` 를 먼저 실행하세요.

## 도커

```bash
JWT_SECRET='<32자 이상 임의 문자열>' yarn docker:up    # postgres + migrator + api + admin-web + user-web 를 각각의 컨테이너로
```

`JWT_SECRET` 은 필수입니다. 넘기지 않으면 compose 가 실행되지 않습니다. 매번 같은 값을 넘겨야 기존 로그인이 유지됩니다.

DB 계정 · 최초 관리자 계정도 실행할 때 덮어쓸 수 있습니다. 넘기지 않은 값은 compose 의 로컬용 기본값을 씁니다.

```bash
JWT_SECRET='<32자 이상 임의 문자열>' INITIAL_ADMIN_ID=owner INITIAL_ADMIN_PASSWORD='<비밀번호>' yarn docker:up
```

값을 env 파일에 모아 두었다면 환경별 명령으로 실행합니다. 각 명령은 저장소 루트의 env 파일을 `--env-file` 로 넘깁니다.

```bash
yarn docker:up:local          # .env.local
yarn docker:up:development    # .env.development
yarn docker:up:production     # .env.production
```

- env 파일은 저장소에 올라가지 않습니다(`.gitignore`). `.env.development` · `.env.production` 은 `.env.local-sample` 을 복사해 값을 바꿔 만드세요.
- env 파일 값 중 아래 표의 변수와 `API_CORS_ORIGINS` · `API_PUBLIC_URL` · `SHARE_LINK_DOWNLOAD_ERROR_COOKIE_MAX_AGE_SECONDS` 만 컨테이너에 반영됩니다. `DB_HOST` · `DB_PORT` · `API_PORT` · `API_INTERNAL_URL` · `STORAGE_DIR` · `API_TRUST_PROXY` 는 compose 가 컨테이너용 값으로 고정합니다.
- `API_TRUST_PROXY` 는 웹 컨테이너의 고정 IP(`172.31.240.10` · `172.31.240.11`)만 신뢰합니다. 웹이 넘긴 `X-Forwarded-For` 만 믿고, 브라우저가 api 에 직접 보낸 헤더는 무시해 IP 정책을 위조로 우회할 수 없게 하기 위해서입니다. 이 대역(`172.31.240.0/24`)이 사내망과 겹치면 `dockers/compose.yml` 의 `web-api` 네트워크와 `API_TRUST_PROXY` 를 함께 바꾸세요.
- 셸 환경변수가 env 파일보다 우선합니다. 같은 이름의 변수가 셸에 남아 있으면 env 파일 값이 무시됩니다.

PowerShell 에서는 `$env:<변수> = '<값>'` 으로 먼저 지정한 뒤 실행합니다. 지정한 값은 그 창을 닫을 때까지 유지됩니다.

```powershell
$env:JWT_SECRET = '<32자 이상 임의 문자열>'; $env:INITIAL_ADMIN_ID = 'owner'; $env:INITIAL_ADMIN_PASSWORD = '<비밀번호>'
yarn docker:up
```

| 변수 | 용도 |
| --- | --- |
| `DB_USER` · `DB_PASSWORD` · `DB_NAME` | postgres 계정 · DB 이름 |
| `JWT_SECRET` | 관리자 토큰 서명 키 (**필수**) |
| `INITIAL_ADMIN_ID` · `INITIAL_ADMIN_PASSWORD` · `INITIAL_ADMIN_NICKNAME` | 최초 관리자 계정 |
| `WEB_TRUSTED_PROXY_HOPS` · `WEB_SECURE_COOKIE` · `USER_WEB_ORIGIN` | 웹 설정 |

## 검사 · 테스트

```bash
yarn lint:check
yarn type:check
yarn e2e            # 격리된 도커 환경에서 servers(jest) · webs(playwright) e2e 실행
yarn e2e:servers
yarn e2e:webs
```

## 권한 코드 추가

- 권한은 관리자 화면에서 만들 수 없습니다. 관리자는 분류 · 권한명 · 설명만 바꿀 수 있습니다.
- 새 권한은 `libs/common-shared/common-utils/src/permissions/permission-code-registry` 에 코드를 추가하고, api 의 `requirePermission(<코드>)` · 관리자 웹의 `hasPermission(<코드>)` 에서 사용합니다.
- DB 에는 `yarn workspace @fms/database-manager seed` 가 레지스트리에 있는데 DB 에 없는 권한만 추가합니다.

## 운영 시 주의

- 관리자 웹 · 공개 링크 웹은 `X-Forwarded-For` 로 요청 IP 를 판정합니다. 웹을 직접 노출하면 클라이언트가 이 헤더를 위조할 수 있으므로, **헤더를 덮어쓰는 리버스 프록시 뒤에 두고** `WEB_TRUSTED_PROXY_HOPS` 를 그 프록시 수로 지정하세요.
- 도커 밖에서 api 를 띄울 때 `API_TRUST_PROXY` 에는 웹 서버의 IP 만 지정하세요. 사설 대역 전체(`uniquelocal` 등)를 넣으면 브라우저가 api 를 직접 호출하며 `X-Forwarded-For` 를 위조할 수 있습니다. 도커에서는 compose 가 정합니다.
- `dockers/compose*.yml` 의 비밀번호 기본값과 `.env.local-sample` 의 값은 **로컬 개발용이며 이 저장소에 공개된 값**입니다. 운영에서는 반드시 위 방법으로 덮어쓰고, `JWT_SECRET` 에도 `.env.local-sample` 의 값을 쓰지 마세요.
- 최초 관리자 계정은 같은 아이디의 계정이 DB 에 없을 때만 만들어집니다. 한 번 띄운 뒤에 `INITIAL_ADMIN_*` 을 바꾸면 반영되지 않으니, 관리자 화면에서 바꾸거나 DB 볼륨을 지우고 다시 띄우세요.
