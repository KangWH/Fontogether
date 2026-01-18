# K-Cloud VM 배포 가이드

## 1. 아키텍처 개요
- **Spring Boot (API)**: Docker Container (Port 80)
- **PostgreSQL (DB)**: Docker Container (Internal Network)
- **접속 방식**: 외부 클라이언트는 K-Cloud 방화벽(Port 80)을 통해 API에 접근.

## 2. 배포 사전 준비
로컬에서 VM으로 파일을 전송해야 합니다. (Git Clone을 해도 되지만, `.env` 등 보안 파일은 직접 전송 필요)

### 필수 파일
1. `docker-compose.yml`
2. `Dockerfile`
3. `src/` (소스 코드)
4. `build.gradle`, `settings.gradle`, `gradlew`, `gradle/`
5. **`.env`** (중요: 서버용 환경변수로 수정 필요할 수 있음)

## 3. 배포 절차 (터미널)

### Step 1: 파일 전송 (SCP 사용 예시)
VM 서버의 IP가 `X.X.X.X`이고 계정이 `root`라고 가정:
```bash
# 로컬 터미널에서 실행 (프로젝트 루트 경로)
scp -r . root@X.X.X.X:/home/server/api
```

### Step 2: VM 접속 및 실행
```bash
ssh root@X.X.X.X
cd /home/server/api

# 도커 컨테이너 빌드 및 실행 (백그라운드)
docker-compose up -d --build
```

### Step 3: 확인
```bash
docker ps
# fontogether_api가 Port 80을 사용 중인지 확인
```

## 4. 주의사항 (K-Cloud 방화벽)
- **Port 80 (HTTP)**: 현재 설정이 80번 포트를 사용하므로 외부에서 `http://[VM_IP]`로 바로 접속 가능합니다.
- **Port 443 (HTTPS)**: 추후 SSL 인증서 적용 시 Nginx 등을 앞단에 두어 443 -> 80으로 포워딩하는 설정이 필요할 수 있습니다.
- **DB 접속**: 외부에서 DB(5432)로 직접 접속은 불가능합니다(방화벽). 개발용 PC에서 DB를 보고 싶다면 SSH 터널링을 이용하세요.
