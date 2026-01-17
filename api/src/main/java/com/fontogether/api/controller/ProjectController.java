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
}
