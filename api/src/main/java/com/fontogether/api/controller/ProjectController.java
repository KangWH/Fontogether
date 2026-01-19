package com.fontogether.api.controller;

import com.fontogether.api.model.domain.Project;
import com.fontogether.api.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Project>> getUserProjects(@PathVariable("userId") Long userId) {
        List<Project> projects = projectService.getProjectsByUserId(userId);
        return ResponseEntity.ok(projects);
    }
    @org.springframework.web.bind.annotation.PostMapping("/template")
    public ResponseEntity<?> createProjectFromTemplate(@org.springframework.web.bind.annotation.RequestBody CreateTemplateRequest request) {
        try {
            Long projectId = projectService.createProjectFromTemplate(request.getOwnerId(), request.getTemplateName());
            return ResponseEntity.ok(projectId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Creation Error: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PostMapping(value = "/ufo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importProject(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @org.springframework.web.bind.annotation.RequestParam("userId") Long userId) {
        try {
            Long projectId = projectService.createProjectFromUfo(userId, file);
            return ResponseEntity.ok(projectId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Import Error: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(@org.springframework.web.bind.annotation.PathVariable("projectId") Long projectId, 
                                           @org.springframework.web.bind.annotation.RequestBody UpdateProjectRequest request) {
        try {
            projectService.updateProject(request.getUserId(), projectId, request.getTitle());
            return ResponseEntity.ok("Project updated successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Update Error: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@org.springframework.web.bind.annotation.PathVariable("projectId") Long projectId, 
                                           @org.springframework.web.bind.annotation.RequestParam("userId") Long userId) {
        try {
            projectService.deleteProject(userId, projectId);
            return ResponseEntity.ok("Project deleted successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Delete Error: " + e.getMessage());
        }
    }

    @lombok.Data
    public static class UpdateProjectRequest {
        private Long userId;
        private String title;
    }

    @lombok.Data
    public static class CreateTemplateRequest {
        private Long ownerId;
        private String templateName; // "Empty", "Basic"
    }
}
