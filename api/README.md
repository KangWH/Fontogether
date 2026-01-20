# Fontogether API

Font 에디터를 웹에서 실시간으로 협업할 수 있게 하는 백엔드 API 서버입니다.

## 기술 스택

- **Java**: JDK 21
- **Framework**: Spring Boot 3.5.10-SNAPSHOT
- **Database**: PostgreSQL 16
- **실시간 통신**: WebSocket (STOMP)
- **빌드 도구**: Gradle

## 주요 기능

### 1. 실시간 협업
- WebSocket을 통한 실시간 글리프(Glyph) 동기화
- 사용자 접속/해제 상태 추적
- 특정 글리프 편집 중인 사용자 표시

### 2. REST API
- 글리프 CRUD 작업
- 프로젝트별 글리프 목록 조회
- 협업자 수 조회

## 프로젝트 구조

```
src/main/java/com/fontogether/api/
├── controller/
│   ├── GlyphController.java          # REST API 컨트롤러
│   ├── WebSocketController.java      # WebSocket 메시지 처리
│   └── TestDbController.java         # DB 연결 테스트 (deprecated)
├── service/
│   ├── GlyphService.java             # 글리프 비즈니스 로직
│   └── CollaborationService.java     # 실시간 협업 세션 관리
├── repository/
│   └── GlyphRepository.java          # DB 접근 계층
├── model/
│   ├── domain/
│   │   ├── Glyph.java                # 글리프 도메인 모델
│   │   └── User.java                 # 사용자 도메인 모델
│   └── dto/
│       ├── GlyphUpdateMessage.java   # WebSocket 메시지 DTO
│       └── UserPresenceMessage.java  # 사용자 상태 메시지 DTO
└── config/
    ├── WebSocketConfig.java          # WebSocket 설정
    ├── SecurityConfig.java           # Spring Security 설정
    └── OpenApiConfig.java            # Swagger (OpenAPI) 설정
```

## API 엔드포인트

자세한 API 명세는 `API_DOCUMENTATION.md` 파일을 참고하세요.

### REST API 요약
- **Auth**: `/api/auth/google`, `/api/users/login`, `/api/users/signup`
- **User**: `/api/users/{id}`, `/api/projects/user/{id}`
- **Project**: `/api/projects`, `/api/projects/template`, `/api/projects/{id}`
- **Collaboration**: `/api/projects/{id}/collaborators`
- **Glyph**: `/api/projects/{id}/glyphs`

### WebSocket

#### 연결
```
ws://localhost:8080/ws
```

#### 메시지 구독 (Server -> Client)

**글리프 업데이트 알림**
```
SUBSCRIBE /topic/project/{projectId}/glyph/update
```

**사용자 상태 변경 알림**
```
SUBSCRIBE /topic/project/{projectId}/presence
```

**강퇴 알림**
```
SUBSCRIBE /topic/project/{projectId}/kick
```

#### 메시지 발행 (Client -> Server)

**글리프 업데이트 전송**
```
SEND /app/glyph/update
Content-Type: application/json

{
  "projectId": 1,
  "unicode": 65,
  "glyphName": "A",
  "pathData": "{\"contours\": [...]}",
  "advanceWidth": 600,
  "userId": 1,
  "nickname": "사용자1"
}
```

**프로젝트 접속**
```
SEND /app/project/join
Content-Type: application/json

{
  "projectId": 1,
  "userId": 1,
  "nickname": "사용자1"
}
```

**프로젝트 나가기**
```
SEND /app/project/leave
Content-Type: application/json

{
  "projectId": 1,
  "userId": 1,
  "nickname": "사용자1"
}
```

**글리프 편집 시작**
```
SEND /app/glyph/start-editing
Content-Type: application/json

{
  "projectId": 1,
  "userId": 1,
  "nickname": "사용자1",
  "editingUnicode": 65
}
```

**글리프 편집 중단**
```
SEND /app/glyph/stop-editing
Content-Type: application/json

{
  "projectId": 1,
  "userId": 1,
  "nickname": "사용자1"
}
```

## 데이터베이스

### 실행 방법

Docker Compose를 사용하여 PostgreSQL을 실행합니다:

```bash
docker-compose up -d
```

### 스키마

주요 테이블:
- `users`: 사용자 정보
- `projects`: 폰트 프로젝트
- `project_collaborators`: 프로젝트 협업자 (M:N 관계)
- `glyphs`: 글리프(글자) 데이터

자세한 스키마는 `src/main/resources/schema.sql`을 참고하세요.

## 실행 방법

### 1. 데이터베이스 실행
```bash
docker-compose up -d
```

### 2. 애플리케이션 실행
```bash
./gradlew bootRun
```
*(The application will automatically load configuration from the `.env` file)*

또는

```bash
./gradlew build
java -jar build/libs/api-0.0.1-SNAPSHOT.jar
```

### 3. API 문서 (Swagger UI)
서버가 실행 중일 때 아래 주소에서 대화형 API 문서를 확인할 수 있습니다.

- **Local**: [http://localhost:80/swagger-ui/index.html](http://localhost:80/swagger-ui/index.html)
- **Production (VM)**: [http://172.10.5.122.nip.io/swagger-ui/index.html](http://172.10.5.122.nip.io/swagger-ui/index.html)

### 4. 프론트엔드 가이드
WebSocket 상세 구현 가이드는 `WEBSOCKET_GUIDE_FRONTEND.md` 파일을 참고하세요.
(한글 번역 제공)

## 개발 환경 설정

### application.yml
```yaml
spring:
  datasource:
  datasource:
    url: jdbc:postgresql://localhost:5432/${POSTGRES_DB}
    username: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
```

### 환경 변수 (.env)
이 프로젝트는 보안을 위해 `.env` 파일을 사용합니다. 프로젝트 루트에 `.env` 파일을 생성하고 다음 값을 채워주세요:

```properties
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=adminpass
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 향후 계획

- [ ] Spring Boot 애플리케이션도 Docker 컨테이너화
- [x] 인증/인가 시스템 추가 (Local & Google OAuth Session)
- [x] 프로젝트 관리 API 추가
- [x] 사용자 관리 API 추가
- [x] 협업 초대 및 권한 관리 API 추가

## 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.
