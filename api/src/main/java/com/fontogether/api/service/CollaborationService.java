package com.fontogether.api.service;

import com.fontogether.api.model.dto.GlyphUpdateMessage;
import com.fontogether.api.model.dto.UserPresenceMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 실시간 협업 세션 관리 서비스
 * - 프로젝트별 접속 사용자 추적
 * - WebSocket 메시지 브로드캐스트
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final SimpMessagingTemplate messagingTemplate;

    // 프로젝트별 접속 중인 사용자 추적: projectId -> Set<userId>
    private final Map<Long, Set<Long>> projectSessions = new ConcurrentHashMap<>();

    // 사용자가 현재 편집 중인 글리프: userId -> (projectId, unicode)
    private final Map<Long, EditingState> userEditingState = new ConcurrentHashMap<>();

    private static class EditingState {
        Long projectId;
        Integer unicode;

        EditingState(Long projectId, Integer unicode) {
            this.projectId = projectId;
            this.unicode = unicode;
        }
    }

    /**
     * 사용자가 프로젝트에 접속했을 때 호출
     */
    public void userJoined(Long projectId, Long userId, String nickname) {
        projectSessions.computeIfAbsent(projectId, k -> new CopyOnWriteArraySet<>()).add(userId);
        
        // 다른 사용자들에게 접속 알림
        UserPresenceMessage message = UserPresenceMessage.builder()
                .userId(userId)
                .nickname(nickname)
                .projectId(projectId)
                .action("JOIN")
                .build();
        
        broadcastToProject(projectId, "/topic/project/" + projectId + "/presence", message);
        log.info("User {} joined project {}", userId, projectId);
    }

    /**
     * 사용자가 프로젝트에서 나갔을 때 호출
     */
    public void userLeft(Long projectId, Long userId, String nickname) {
        Set<Long> users = projectSessions.get(projectId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                projectSessions.remove(projectId);
            }
        }
        
        userEditingState.remove(userId);
        
        // 다른 사용자들에게 해제 알림
        UserPresenceMessage message = UserPresenceMessage.builder()
                .userId(userId)
                .nickname(nickname)
                .projectId(projectId)
                .action("LEAVE")
                .build();
        
        broadcastToProject(projectId, "/topic/project/" + projectId + "/presence", message);
        log.info("User {} left project {}", userId, projectId);
    }

    /**
     * 사용자가 특정 글리프를 편집하기 시작했을 때
     */
    public void userStartedEditing(Long projectId, Long userId, String nickname, Integer unicode) {
        userEditingState.put(userId, new EditingState(projectId, unicode));
        
        UserPresenceMessage message = UserPresenceMessage.builder()
                .userId(userId)
                .nickname(nickname)
                .projectId(projectId)
                .action("EDITING")
                .editingUnicode(unicode)
                .build();
        
        broadcastToProject(projectId, "/topic/project/" + projectId + "/presence", message);
        log.info("User {} started editing glyph {} in project {}", userId, unicode, projectId);
    }

    /**
     * 사용자가 글리프 편집을 중단했을 때
     */
    public void userStoppedEditing(Long projectId, Long userId, String nickname) {
        userEditingState.remove(userId);
        
        UserPresenceMessage message = UserPresenceMessage.builder()
                .userId(userId)
                .nickname(nickname)
                .projectId(projectId)
                .action("IDLE")
                .build();
        
        broadcastToProject(projectId, "/topic/project/" + projectId + "/presence", message);
        log.info("User {} stopped editing in project {}", userId, projectId);
    }

    /**
     * Glyph 업데이트를 프로젝트의 모든 사용자에게 브로드캐스트
     */
    public void broadcastGlyphUpdate(Long projectId, GlyphUpdateMessage message) {
        String destination = "/topic/project/" + projectId + "/glyph/update";
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Broadcasted glyph update for project {}: unicode={}", projectId, message.getUnicode());
    }

    /**
     * 프로젝트의 모든 사용자에게 메시지 브로드캐스트 (범용)
     */
    private void broadcastToProject(Long projectId, String destination, Object message) {
        messagingTemplate.convertAndSend(destination, message);
    }

    /**
     * 프로젝트에 접속 중인 사용자 수 조회
     */
    public int getActiveUserCount(Long projectId) {
        Set<Long> users = projectSessions.get(projectId);
        return users != null ? users.size() : 0;
    }
}
