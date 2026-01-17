# Fontogether API Documentation

## 🌐 Base Config
- **REST Base URL**: `http://localhost:444`
- **WebSocket URL**: `ws://localhost:444/ws`
- **Socket Client**: SockJS supported

---

## 👤 User API
> 사용자 관리 및 인증

### 1. 회원가입
- **URL**: `POST /api/users/signup`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "Designer"
  }
  ```
- **Response**: `200 OK` (User ID: `Long`)

### 2. 로그인
- **URL**: `POST /api/users/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (User Object)
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "Designer",
    "provider": "local",
    "createdAt": "..."
  }
  ```

### 3. 사용자 프로젝트 목록 조회
- **URL**: `GET /api/projects/user/{userId}`
- **Response**: `200 OK` (List of Projects)
  ```json
  [
    {
      "projectId": 1,
      "title": "My First Font",
      "ownerId": 1,
      "createdAt": "..."
    }
  ]
  ```

---

## ✒️ Glyph API (REST)
> 글리프 데이터 CRUD 및 동기화

### 1. 글리프 단건 조회
- **URL**: `GET /api/projects/{projectId}/glyphs/{glyphName}`
- **Path Variables**:
  - `projectId`: 프로젝트 ID
  - `glyphName`: 글자 이름 (예: `A` or `.notdef`)
- **Response**: `200 OK`
  ```json
  {
    "glyphUuid": "...",
    "projectId": 1,
    "glyphName": "A",
    "unicodes": ["0041"],
    "advanceWidth": 600,
    "outlineData": "{\"contours\": [...]}",
    "properties": "{...}"
  }
  ```
  *(데이터가 없으면 비어있는 기본 UFO .glif 구조 반환)*

### 2. 프로젝트 전체 글리프 조회
- **URL**: `GET /api/projects/{projectId}/glyphs`
- **Response**: `200 OK` (List of Glyphs)

### 3. 글리프 저장 (REST)
> **Note**: 실시간 협업 시에는 WebSocket 권장. 이 API는 대량 업로드/백업용.
- **URL**: `POST /api/projects/{projectId}/glyphs`
- **Request Body**:
  ```json
  {
    "projectId": 1,
    "glyphName": "A",
    "unicodes": ["0041"],
    "outlineData": "...", 
    "advanceWidth": 600
  }
  ```

### 4. 접속자 수 조회
- **URL**: `GET /api/projects/{projectId}/collaborators/count`
- **Response**: `Number` (현재 접속 중인 사용자 수)

---

## ⚡ WebSocket API (Real-time)
> 실시간 협업 프로토콜 (STOMP)

### Connection
- **Endpoint**: `/ws`
- **Topic Prefix** (Server -> Client): `/topic`
- **App Prefix** (Client -> Server): `/app`

### 1. Glyph Update (글자 수정)
- **Send To**: `/app/glyph/update`
- **Subscribe**: `/topic/project/{projectId}/glyph/update`
- **Payload**:
  ```json
  {
    "projectId": 1,
    "glyphName": "A",
    "outlineData": "{\"contours\": ...}",
    "advanceWidth": 600,
    "userId": 1,
    "nickname": "Designer"
  }
  ```

### 2. User Presence (접속 상태)
- **Subscribe**: `/topic/project/{projectId}/presence`

#### A. 입장 (Join)
- **Send To**: `/app/project/join`
- **Payload**: `{ "userId": 1, "nickname": "...", "projectId": 1 }`

#### B. 퇴장 (Leave)
- **Send To**: `/app/project/leave`
- **Payload**: `{ "userId": 1, "nickname": "...", "projectId": 1 }`

#### C. 편집 시작 (Focus)
- **Send To**: `/app/glyph/start-editing`
- **Payload**: 
  ```json
  { 
    "userId": 1, 
    "projectId": 1, 
    "editingUnicode": "0041" 
  }
  ```
  *(다른 사용자에게 "누가 이 글자를 고치고 있음"을 알림)*

#### D. 편집 종료 (Blur)
- **Send To**: `/app/glyph/stop-editing`
- **Payload**: `{ "userId": 1, "projectId": 1 }`
