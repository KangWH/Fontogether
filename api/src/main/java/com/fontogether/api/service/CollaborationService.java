package com.fontogether.api.service;

import com.fontogether.api.model.domain.Project;
import com.fontogether.api.repository.ProjectRepository;
import com.fontogether.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public List<ProjectRepository.Collaborator> getCollaborators(Long projectId) {
        return projectRepository.findCollaborators(projectId);
    }

    @Transactional
    public void addCollaborator(Long requesterId, Long projectId, String email, String role) {
        verifyOwner(requesterId, projectId);
        
        Long userIdToAdd = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email))
                .getId();

        projectRepository.addCollaborator(projectId, userIdToAdd, role);
    }

    @Transactional
    public void updateCollaboratorRole(Long requesterId, Long projectId, Long targetUserId, String newRole) {
        verifyOwner(requesterId, projectId);
        projectRepository.updateCollaboratorRole(projectId, targetUserId, newRole);
    }

    @Transactional
    public void removeCollaborator(Long requesterId, Long projectId, Long targetUserId) {
        // Owner can remove anyone.
        // User can remove themselves (Leave project).
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (!project.getOwnerId().equals(requesterId) && !requesterId.equals(targetUserId)) {
            throw new SecurityException("Not authorized to remove this collaborator");
        }

        projectRepository.removeCollaborator(projectId, targetUserId);
        
        // Notify clients via WebSocket
        broadcastKick(projectId, targetUserId);
    }

    private void verifyOwner(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        if (!project.getOwnerId().equals(userId)) {
            throw new SecurityException("Only owner can perform this action");
        }
    }

    private void broadcastKick(Long projectId, Long kickedUserId) {
        // Topic: /topic/project/{projectId}/kick
        // Payload: { "kickedUserId": 123 }
        String destination = "/topic/project/" + projectId + "/kick";
        java.util.Map<String, Long> payload = java.util.Collections.singletonMap("kickedUserId", kickedUserId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    // --- WebSocket Event Handlers ---

    public void userJoined(Long projectId, Long userId, String nickname) {
        // Broadcast to /topic/project/{projectId}/presence
        String destination = "/topic/project/" + projectId + "/presence";
        // Payload structure can be flexible, reusing UserPresenceMessage logic usually
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "type", "JOIN",
            "projectId", projectId,
            "userId", userId,
            "nickname", nickname
        ));
    }

    public void userLeft(Long projectId, Long userId, String nickname) {
        String destination = "/topic/project/" + projectId + "/presence";
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "type", "LEAVE",
            "projectId", projectId,
            "userId", userId,
            "nickname", nickname
        ));
    }

    public void userStartedEditing(Long projectId, Long userId, String nickname, Integer unicode) {
        String destination = "/topic/project/" + projectId + "/presence";
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "type", "START_EDIT",
            "projectId", projectId,
            "userId", userId,
            "nickname", nickname,
            "editingUnicode", unicode
        ));
    }

    public void userStoppedEditing(Long projectId, Long userId, String nickname) {
        String destination = "/topic/project/" + projectId + "/presence";
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "type", "STOP_EDIT",
            "projectId", projectId,
            "userId", userId,
            "nickname", nickname
        ));
    }

    public void broadcastGlyphUpdate(Long projectId, Object payload) {
        // Topic: /topic/project/{projectId}/glyph/update
        String destination = "/topic/project/" + projectId + "/glyph/update";
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void persistProjectDetail(com.fontogether.api.model.dto.ProjectDetailUpdateMessage message) {
        // 1. Validate Update Type -> Column
        String column = switch (message.getUpdateType()) {
            case "META_INFO" -> "meta_info";
            case "FONT_INFO" -> "font_info";
            case "GROUPS" -> "groups";
            case "KERNING" -> "kerning";
            case "FEATURES" -> "features";
            case "LAYER_CONFIG" -> "layer_config";
            default -> throw new IllegalArgumentException("Unknown update type: " + message.getUpdateType());
        };

        // 2. Persist to DB
        projectRepository.updateProjectDetail(message.getProjectId(), column, message.getData());

        // 3. Broadcast to all clients (including sender, or exclude sender if optimized)
        String destination = "/topic/project/" + message.getProjectId() + "/update/details";
        messagingTemplate.convertAndSend(destination, message);
    }

    public int getActiveUserCount(Long projectId) {
        // TODO: Implement real session tracking using SessionRegistry or equivalent.
        // For now, return 0 or rely on client-side counting via presence topic.
        return 0;
    }
}
