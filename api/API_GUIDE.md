# API 개발 및 보안 가이드

## 1. 새로운 API 추가 방법
새로운 기능을 추가할 때는 **Controller -> Service -> Repository** 순서로 작업하세요.

### 1단계: Controller (진입점)
- **위치**: `src/main/java/com/fontogether/api/controller/`
- **역할**: HTTP 요청을 받고 응답을 반환합니다.
- **예시**:
  ```java
  @RestController
  @RequestMapping("/api/projects")
  public class ProjectController {
      @GetMapping("/user/{userId}")
      public ResponseEntity<List<Project>> getUserProjects(...) { ... }
  }
  ```

### 2단계: Service (비즈니스 로직)
- **위치**: `src/main/java/com/fontogether/api/service/`
- **역할**: 비즈니스 로직을 포함하며 Repository를 호출합니다.
- **예시**: `ProjectService.java`

### 3단계: Repository (데이터베이스 접근)
- **위치**: `src/main/java/com/fontogether/api/repository/`
- **역할**: `JdbcTemplate`을 사용하여 SQL 쿼리를 실행합니다.
- **예시**: `ProjectRepository.java`

### 4단계: SecurityConfig (권한 설정)
- **위치**: `src/main/java/com/fontogether/api/config/SecurityConfig.java`
- **조치**: API가 누구나 접근 가능한 공개(Public) 상태여야 한다면 `.requestMatchers("/api/new-path/**").permitAll()`을 추가하세요. 그렇지 않으면 기본적으로 인증이 필요합니다.

---

## 2. 접근 제어 구현 (보안)
권한이 없는 사용자가 비공개 프로젝트를 볼 수 없도록 **요청자의 신원을 반드시 검증**해야 합니다.

### 전략
현재 완전한 토큰 기반 인증이 활성화되지 않았으므로, **Service 계층**에서 데이터베이스 조회를 통해 검증을 수행합니다.

### 구현 단계

#### 1단계: Repository에 검증 쿼리 추가
사용자가 프로젝트의 소유자(Owner)이거나 협업자(Collaborator)인지 확인하는 메소드를 추가합니다.
```java
// ProjectRepository.java
public boolean isProjectMember(Long projectId, Long userId) {
    String sql = """
        SELECT COUNT(*) FROM font_project p
        LEFT JOIN project_collaborators pc ON p.project_id = pc.project_id
        WHERE p.project_id = ? 
        AND (p.owner_id = ? OR pc.user_id = ?)
    """;
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, projectId, userId, userId);
    return count != null && count > 0;
}
```

#### 2단계: Service에서 권한 검사
데이터를 반환하기 전에 검증 메소드를 호출합니다.
```java
// ProjectService.java
public Project getProjectDetail(Long projectId, Long userId) {
    // 1. 권한 검사
    if (!projectRepository.isProjectMember(projectId, userId)) {
        throw new IllegalArgumentException("접근 거부: 이 프로젝트의 멤버가 아닙니다.");
    }
    
    // 2. 데이터 조회
    return projectRepository.findById(projectId);
}
```

이 방식을 사용하면 누군가 URL을 추측해서 접근하더라도, 유효한 멤버가 아니면 데이터를 획득할 수 없습니다.
