package com.fontogether.api.service;

import com.fontogether.api.model.domain.Project;
import com.fontogether.api.repository.ProjectRepository;
import com.fontogether.api.repository.UserRepository;
import com.fontogether.api.service.GlyphService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GlyphService glyphService;

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
            case "LIB" -> "lib";
            default -> throw new IllegalArgumentException("Unknown update type: " + message.getUpdateType());
        };

        // 2. Persist to DB
        projectRepository.updateProjectDetail(message.getProjectId(), column, message.getData());

        // 3. Broadcast to all clients (including sender, or exclude sender if optimized)
        String destination = "/topic/project/" + message.getProjectId() + "/update/details";
        messagingTemplate.convertAndSend(destination, message);
    }
    
    @Transactional
    public void handleGlyphAction(com.fontogether.api.model.dto.GlyphActionMessage message) {
        Long projectId = message.getProjectId();
        
        switch (message.getAction()) {
            case RENAME:
                glyphService.renameGlyph(projectId, message.getGlyphName(), message.getNewName());
                updateGlyphOrderInLib(projectId, order -> {
                   int idx = order.indexOf(message.getGlyphName());
                   if (idx != -1) {
                       order.set(idx, message.getNewName());
                   }
                });
                break;
                
            case DELETE:
                glyphService.deleteGlyph(projectId, message.getGlyphName());
                updateGlyphOrderInLib(projectId, order -> order.remove(message.getGlyphName()));
                break;
                
            case ADD:
                // Create an empty glyph
                glyphService.saveGlyph(projectId, message.getGlyphName(), "{\"contours\":[]}", 500);
                updateGlyphOrderInLib(projectId, order -> {
                    if (!order.contains(message.getGlyphName())) {
                        order.add(message.getGlyphName());
                    }
                });
                break;
                
            case REORDER:
                updateGlyphOrderInLib(projectId, order -> {
                    order.clear();
                    order.addAll(message.getNewOrder());
                });
                break;
                
            case MOVE:
                updateGlyphOrderInLib(projectId, order -> {
                    // 1. Remove if exists
                    order.remove(message.getGlyphName());
                    
                    // 2. Insert at index
                    int idx = message.getToIndex();
                    if (idx < 0) idx = 0;
                    if (idx > order.size()) idx = order.size();
                    
                    order.add(idx, message.getGlyphName());
                });
                break;
        }

        // Broadcast Action
        String destination = "/topic/project/" + projectId + "/glyph/action";
        messagingTemplate.convertAndSend(destination, message);
    }

    private void updateGlyphOrderInLib(Long projectId, java.util.function.Consumer<List<String>> modifier) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            // Parse lib JSON
            java.util.Map<String, Object> libMap = new java.util.HashMap<>();
            if (project.getLib() != null && !project.getLib().isEmpty()) {
                libMap = mapper.readValue(project.getLib(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
            }
            
            // Get or Create public.glyphOrder
            List<String> glyphOrder = (List<String>) libMap.computeIfAbsent("public.glyphOrder", k -> new java.util.ArrayList<String>());
            
            // Apply modification
            modifier.accept(glyphOrder);
            
            // Save back
            String newLibJson = mapper.writeValueAsString(libMap);
            projectRepository.updateProjectDetail(projectId, "lib", newLibJson);
            
            // Also broadcast LIB update so clients sync their lib state
            com.fontogether.api.model.dto.ProjectDetailUpdateMessage libUpdate = new com.fontogether.api.model.dto.ProjectDetailUpdateMessage();
            libUpdate.setProjectId(projectId);
            libUpdate.setUpdateType("LIB");
            libUpdate.setData(newLibJson);
            broadcastProjectDetailUpdate(libUpdate);

        } catch (Exception e) {
            throw new RuntimeException("Failed to update glyph order in lib", e);
        }
    }
    
    private void broadcastProjectDetailUpdate(com.fontogether.api.model.dto.ProjectDetailUpdateMessage message) {
        String destination = "/topic/project/" + message.getProjectId() + "/update/details";
        messagingTemplate.convertAndSend(destination, message);
    }

    public int getActiveUserCount(Long projectId) {
        // TODO: Implement real session tracking using SessionRegistry or equivalent.
        // For now, return 0 or rely on client-side counting via presence topic.
        return 0;
    }
}
