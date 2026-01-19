# 프론트엔드 배포 가이드 (폴더 분리 구조 유지)

## 📌 구조 설명
사용자분의 요청대로 VM에서도 폴더를 분리해서 관리합니다.
- `/home/server/api` (백엔드)
- `/home/server/fontogether` (프론트엔드)

하지만 **세션/쿠키 로그인**을 위해, **실행될 때만큼은** 프론트엔드 결과물이 백엔드 속으로 들어가서 통합되어야 합니다.

---

## 🛠️ 1단계: 프론트엔드 빌드 (내 컴퓨터)
1.  내 컴퓨터의 `fontogether` 폴더에서 빌드합니다.
    ```bash
    npm run build
    # 결과물: build 폴더 생성됨
    ```

---

## 📤 2단계: VM으로 전송 (폴더 분리)
1.  **프론트엔드 폴더(결과물) 전송**:
    VM에 `fontogether` 폴더를 만들고 그 안에 결과물을 넣습니다.
    *(아래 명령어는 `fontogether` 폴더 옆 상위 경로에서 실행한다고 가정)*
    ```bash
    # 1. VM에 폴더 생성
    ssh root@172.10.5.122 "mkdir -p /home/server/fontogether/build"

    # 2. 빌드된 파일들을 그곳으로 전송
    scp -r fontogether/build/* root@172.10.5.122:/home/server/fontogether/build/
    ```

---

## 🚚 3단계: 배포 (통합 과정)
VM 안에서 프론트엔드 파일을 백엔드 폴더로 **복사**해주어야 합니다. (배포의 핵심)

1.  **VM 접속**:
    ```bash
    ssh root@172.10.5.122
    ```

2.  **파일 합치기 (복사)**:
    ```bash
    # 백엔드의 static 폴더 비우기 (깨끗하게)
    rm -rf /home/server/api/src/main/resources/static/*

    # 프론트엔드 결과물을 백엔드로 복사
    cp -r /home/server/fontogether/build/* /home/server/api/src/main/resources/static/
    ```

3.  **최종 Docker 빌드**:
    ```bash
    cd /home/server/api
    docker-compose up -d --build
    ```

---

## ❓ Q&A: index.html 위치가 바뀌나요?
-   **소스 코드 상**: 아니요. 여전히 `fontogether` 폴더 안에서 개발하시면 됩니다.
-   **배포 과정 상**: 네. 위 3단계 과정을 거치면 `index.html`이 `api` 폴더 안의 `static` 폴더로 복사되어 들어갑니다.
-   **결과**: 사용자는 `http://172.10.5.122.nip.io`에 접속하면 Spring Boot가 `api` 폴더 안에 들어온 `index.html`을 보여줍니다.
