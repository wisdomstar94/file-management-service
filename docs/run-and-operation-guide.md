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

샘플 env 파일을 복사한 뒤 그 파일로 실행합니다. 컨테이너에 넣을 파일은 `FMS_ENV_FILE` 로, postgres 계정 설정에 쓸 파일은 `--env-file` 로 넘기며 둘 다 같은 파일이어야 합니다.

#### macOS · Linux

```bash
cp .env.local-sample .env.local
FMS_ENV_FILE=.env.local docker compose --env-file .env.local -p fms-quickstart -f dockers/compose.yml up -d --build
```

#### Windows (PowerShell)

```powershell
Copy-Item .env.local-sample .env.local
$env:FMS_ENV_FILE = '.env.local'
docker compose --env-file .env.local -p fms-quickstart -f dockers/compose.yml up -d --build
```

- cmd 에서는 `copy .env.local-sample .env.local` · `set FMS_ENV_FILE=.env.local` 을 먼저 실행한 뒤 같은 `docker compose` 명령을 씁니다.
- PowerShell · cmd 에서 지정한 `FMS_ENV_FILE` 은 그 창을 닫으면 사라집니다. 새 창에서 종료할 때는 다시 지정하세요.
- `.env.local` 의 `JWT_SECRET_*` 은 저장소에 공개된 로컬용 값입니다. 둘러보기 용도면 그대로 써도 되고, 외부에 열어 둘 거라면 각각 서로 다른 32자 이상의 임의 문자열로 바꾸세요.

#### 실행 후

- DB 마이그레이션과 최초 관리자 계정 생성은 컨테이너가 뜰 때 자동으로 실행됩니다.

| 화면 | 주소 | 비고 |
| --- | --- | --- |
| 관리자 웹 | http://localhost:3000 | 아이디 `admin` · 비밀번호 `admin1234!` |
| 공개 링크 웹 | `http://localhost:3001/s/<shareLinkKey>` | 관리자 웹에서 만든 외부 공개 링크로 열립니다 |
| API 상태 확인 | http://localhost:4000/api/health | `{"data":{"status":"ok"}}` |

### 둘러보기

1. 관리자 웹에 로그인합니다.
2. **자료 관리** 에서 **새 자료 등록** 으로 파일을 올리고, 자료 상세에서 **새 버전 등록** 으로 버전을 쌓아 봅니다.
3. 자료 상세에서 **외부 공개 링크 생성** 으로 링크를 만듭니다. 비밀번호 · 다운로드 기간 · 총 다운로드 허용 수 · 노출할 버전을 정할 수 있습니다.
4. **링크 복사** 로 받은 주소를 새 창에서 열어 공개 링크 웹에서 파일을 내려받습니다.
5. **관리자 계정 관리** · **권한 그룹 관리** · **접근 정책 그룹 관리** 에서 관리자별 권한과 IP · 요청 헤더 기반 접근 제한을 설정해 봅니다.

### 종료

```bash
FMS_ENV_FILE=.env.local docker compose --env-file .env.local -p fms-quickstart -f dockers/compose.yml down      # 컨테이너만 정리 (데이터 유지)
FMS_ENV_FILE=.env.local docker compose --env-file .env.local -p fms-quickstart -f dockers/compose.yml down -v   # 업로드 파일 · DB 데이터까지 삭제
```

- PowerShell · cmd 에서는 실행할 때처럼 `FMS_ENV_FILE` 을 먼저 지정한 뒤 `docker compose ...` 부분만 실행합니다.

- `-p fms-quickstart` 는 로컬 개발용 DB(`fms` 프로젝트)와 볼륨을 나누기 위한 옵션입니다. 실행과 종료에 같은 값을 넣어야 합니다.

## 구성

| 경로 | 설명 |
| --- | --- |
| `servers/api` | Express API (`/api/admin/**` 관리자, `/api/public/**` 외부 공개 링크) |
| `servers/database-manager` | TypeORM 마이그레이션 · 시드 CLI |
| `webs/file-management-service-admin` | 관리자 웹 (Next.js, 3000) |
| `webs/file-management-service-user` | 외부 공개 링크 웹 (Next.js, 3001, `/s/<shareLinkKey>`) |
| `libs/**` | 공용 패키지. vite 로 sub export 빌드 (`dist/<그룹>/<모듈>/index.{mjs,cjs,d.ts}`). `libs/internal/biome-config` 는 biome 공용 설정 |
| `dockers/` | Dockerfile(서비스별 · e2e) · compose (개발 · 서비스별 단독 · e2e) |

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

### 서비스별 node 실행 (도커 없이)

도커 없이 서비스 하나를 빌드해 node 로 바로 띄웁니다. 개발 모드(`dev`)가 아니라 빌드 결과물을 실행합니다.

```bash
yarn node:up:api:local            # libs · database-manager · api 빌드 → 마이그레이션 + 시드 → api 실행
yarn node:up:admin-web:local      # libs · 관리자 웹 빌드 → 실행 (3000)
yarn node:up:user-web:local       # libs · 공개 링크 웹 빌드 → 실행 (3001)
# :development · :production 도 있습니다 (.env.development · .env.production)
```

- 읽을 env 파일은 `FMS_ENV_FILE` 로 고릅니다. 워크스페이스 스크립트(`start` · `build` · `setup` 등)를 직접 실행할 때도 `FMS_ENV_FILE=.env.production yarn workspace @fms/api start` 처럼 쓸 수 있고, 지정하지 않으면 `.env.local` 입니다.
- 포그라운드로 실행되므로 서비스마다 터미널을 따로 씁니다. 종료는 `Ctrl+C` 입니다.
- DB 는 띄우지 않습니다. env 파일의 `DB_*` 가 가리키는 DB 가 먼저 떠 있어야 합니다.

## DB 마이그레이션

```bash
yarn workspace @fms/database-manager migration:generate src/migrations/<이름>   # 엔티티 변경 감지 → 마이그레이션 생성
yarn workspace @fms/database-manager migration:create src/migrations/<이름>     # 직접 작성할 빈 DB 마이그레이션 생성
yarn workspace @fms/database-manager build
yarn workspace @fms/database-manager migration:run
yarn workspace @fms/database-manager migration:revert
```

- 엔티티는 `libs/server-shared/database-entities` 에 있습니다. 엔티티를 고친 뒤 `yarn libs:build` 를 먼저 실행하세요.
- DB 마이그레이션은 위 두 명령으로만 만들고 파일명의 timestamp 를 직접 짓지 않습니다. `yarn lint:check` 가 검사합니다.

## 도커

postgres + migrator + api + admin-web + user-web 를 각각의 컨테이너로 띄웁니다. 환경별로 저장소 루트의 env 파일을 골라 실행합니다.

```bash
yarn docker:up:all:local          # .env.local
yarn docker:up:all:development    # .env.development
yarn docker:up:all:production     # .env.production
```

- 각 명령은 `FMS_ENV_FILE` 로 컨테이너에 넣을 env 파일을 고르고, 같은 파일을 `--env-file` 로도 넘깁니다(postgres 계정 설정용). `docker compose` 를 직접 실행할 때도 `FMS_ENV_FILE` 은 필수이며, 빠지면 compose 가 실행되지 않습니다.
- env 파일은 저장소에 올라가지 않습니다(`.gitignore`). `.env.development` · `.env.production` 은 `.env.local-sample` 을 복사해 값을 바꿔 만드세요. 맨 위 `APP_ENV` 도 `development` · `production` 으로 바꿉니다.
- env 파일의 변수는 모두 컨테이너에 그대로 들어갑니다. 변수를 새로 추가해도 compose 는 고치지 않아도 됩니다.
- 단, `DB_HOST` · `DB_PORT` · `API_PORT` · `STORAGE_DIR` · `API_TRUST_PROXY` · `API_INTERNAL_URL` 은 컨테이너 안에서 값이 달라야 해서 compose 가 고정하고, env 파일 값보다 우선합니다. (`API_PORT` · `STORAGE_DIR` 은 `dockers/compose.standalone.yml`, 나머지는 `dockers/compose.yml`)
- `JWT_SECRET_ADMIN_ACCOUNT` · `JWT_SECRET_ADMIN_SHORT_TIME` · `JWT_SECRET_SHARE_LINK_UNLOCK` 은 필수입니다. 각각 관리자 access token · 업로드 · 다운로드용 short-time token · 공개 링크 잠금 해제 토큰의 서명 키이고, 매번 같은 값이어야 기존 로그인 · 잠금 해제가 유지됩니다. 운영에서는 각각 서로 다른 32자 이상의 임의 문자열로 바꾸세요.
- `ADMIN_REFRESH_TOKEN_REUSE_GRACE_SECONDS`(api, 기본 30) 는 갱신에 쓴 관리자 refresh token 을 다시 받아 주는 시간입니다. 동시에 들어온 갱신 요청이 서로를 로그아웃시키지 않게 하며, 이 시간이 지난 뒤 다시 쓰이면 탈취로 보고 그 로그인의 토큰을 모두 폐기합니다. `WEB_ACCESS_TOKEN_REFRESH_BEFORE_SECONDS`(관리자 웹, 기본 60) 는 access token 을 만료 전 몇 초부터 미리 갱신할지 정합니다. 자세한 내용은 [`jwt-refresh-strategies.md`](jwt-refresh-strategies.md) 를 보세요.
- `API_TRUST_PROXY` 는 웹 컨테이너의 고정 IP(`172.31.240.10` · `172.31.240.11`)만 신뢰합니다. 웹이 넘긴 `X-Forwarded-For` 만 믿고, 브라우저가 api 에 직접 보낸 헤더는 무시해 IP 정책을 위조로 우회할 수 없게 하기 위해서입니다. 이 대역(`172.31.240.0/24`)이 사내망과 겹치면 `dockers/compose.yml` 의 `web-api` 네트워크와 `API_TRUST_PROXY` 를 함께 바꾸세요.
- 관리자 로그인 · 로그아웃과 공개 링크 비밀번호 확인 · 다운로드는 브라우저가 api 를 직접 호출하고, api 가 httpOnly 쿠키를 심습니다. 그래서 **api 와 웹은 같은 사이트(같은 상위 도메인)에 있어야 합니다.** 예) `admin.example.com` · `files.example.com` · `api.example.com` 이면 `COOKIE_DOMAIN=.example.com`. 같은 호스트에 포트만 다르게 띄우면(`localhost`) 비워 둡니다.
- 셸에 `DB_USER` · `DB_PASSWORD` · `DB_NAME` 이 남아 있으면 postgres 계정만 그 값으로 만들어집니다(compose 의 `${...}` 는 셸 값이 우선). 실행 전에 셸에서 지우세요.

### 서비스별 단독 실행

api 와 웹을 서로 다른 서버에 나눠 띄울 때는 서비스 하나씩 독립 컨테이너로 띄웁니다. `dockers/compose.standalone.yml` 을 씁니다.

```bash
yarn docker:up:api:local            # migrator + api
yarn docker:up:admin-web:local      # 관리자 웹
yarn docker:up:user-web:local       # 공개 링크 웹
# :development · :production 도 있습니다 (.env.development · .env.production)
```

- postgres 는 띄우지 않습니다. 따로 준비한 DB 를 env 파일의 `DB_*` 로 지정하세요.
- 서비스끼리 네트워크를 나누지 않으므로 `DB_HOST` · `API_INTERNAL_URL` · `API_TRUST_PROXY` 는 env 파일 값을 그대로 씁니다. 컨테이너 안에서 `127.0.0.1` 은 컨테이너 자신이라, 같은 호스트의 DB · api 에 닿으려면 `host.docker.internal` 을 쓰세요. 예) `DB_HOST=host.docker.internal` · `DB_PORT=15432` · `API_INTERNAL_URL=http://host.docker.internal:4000`
- `API_TRUST_PROXY` 에는 웹 서버가 api 에 닿을 때의 출발 IP 만 넣으세요(운영 시 주의 참고). 컨테이너 안 경로 · 포트인 `API_PORT` · `STORAGE_DIR` 만 compose 가 고정합니다.
- 서비스마다 compose 프로젝트(`fms-api` · `fms-admin-web` · `fms-user-web`)가 따로라, 하나를 내리거나 다시 띄워도 나머지에 영향이 없습니다. 종료는 같은 프로젝트 이름으로 합니다. 예) `FMS_ENV_FILE=.env.local docker compose -p fms-api -f dockers/compose.standalone.yml down`
- 호스트 포트(4000 · 3000 · 3001)가 `yarn docker:up:all:<환경>` 과 같으므로 한 호스트에서 둘을 함께 띄울 수는 없습니다.

## 검사 · 테스트

```bash
yarn lint:check
yarn type:check
yarn e2e            # 격리된 도커 환경에서 servers(jest) · webs(playwright) e2e 실행
yarn e2e:servers
yarn e2e:webs
```

- `type:check` 는 앱 코드와 각 앱의 `e2e/tsconfig.json` 을 함께 검사합니다. 새 앱을 추가할 때도 `e2e/tsconfig.json` 을 두고 `type:check` 에 `tsc --noEmit -p ./e2e/tsconfig.json` 을 붙이세요.

## 권한 코드 추가

- 권한은 관리자 화면에서 만들 수 없습니다. 관리자는 분류 · 권한명 · 설명만 바꿀 수 있습니다.
- 새 권한은 `libs/common-shared/consts/src/permissions/permission-code-registry` 에 코드를 추가하고, api 의 `requirePermission(<코드>)` · 관리자 웹의 `hasPermission(<코드>)` 에서 사용합니다.
- DB 에는 `yarn workspace @fms/database-manager seed` 가 레지스트리에 있는데 DB 에 없는 권한만 추가합니다.

## 운영 시 주의

- 관리자 웹 · 공개 링크 웹은 `X-Forwarded-For` 로 요청 IP 를 판정합니다. 웹을 직접 노출하면 클라이언트가 이 헤더를 위조할 수 있으므로, **헤더를 덮어쓰는 리버스 프록시 뒤에 두고** `WEB_TRUSTED_PROXY_HOPS` 를 그 프록시 수로 지정하세요.
- 도커 밖에서 api 를 띄울 때 `API_TRUST_PROXY` 에는 웹 서버의 IP 만 지정하세요. 사설 대역 전체(`uniquelocal` 등)를 넣으면 브라우저가 api 를 직접 호출하며 `X-Forwarded-For` 를 위조할 수 있습니다. 도커에서는 compose 가 정합니다.
- `dockers/compose*.yml` 의 비밀번호 기본값과 `.env.local-sample` 의 값은 **로컬 개발용이며 이 저장소에 공개된 값**입니다. 운영에서는 반드시 위 방법으로 덮어쓰고, `JWT_SECRET_*` 에도 `.env.local-sample` 의 값을 쓰지 마세요.
- 최초 관리자 계정은 같은 아이디의 계정이 DB 에 없을 때만 만들어집니다. 한 번 띄운 뒤에 `INITIAL_ADMIN_*` 을 바꾸면 반영되지 않으니, 관리자 화면에서 바꾸거나 DB 볼륨을 지우고 다시 띄우세요.
