package com.fontogether.api.service;

import com.fontogether.api.model.domain.Project;
import com.fontogether.api.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final com.fontogether.api.repository.GlyphRepository glyphRepository;
    private final UfoImportService ufoImportService;

    @Transactional(readOnly = true)
    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findAllByUserId(userId);
    }

    @Transactional
    public Long createProjectFromTemplate(Long ownerId, String templateName) {
        Project project = Project.builder()
                .ownerId(ownerId)
                .title("New Project (" + templateName + ")")
                .build();

        // 템플릿 데이터 적용 (하드코딩 예시)
        if ("Empty".equalsIgnoreCase(templateName)) {
            project.setMetaInfo("{}");
            project.setFontInfo("{}");
            project.setGroups("{}");
            project.setKerning("{}");
            project.setFeatures("");
            project.setLayerConfig("{\"layers\": [{\"name\": \"public.default\", \"color\": \"#000000\"}]}");
        } else if ("Basic".equalsIgnoreCase(templateName)) {
             // 기본 설정이 들어간 템플릿
             project.setMetaInfo("{\"version\": 1, " + "\"creator\": \"Fontogether\"}");
             project.setFontInfo("{\"familyName\": \"New Font\", \"styleName\": \"Regular\"}");
             project.setLayerConfig("{\"layers\": [{\"name\": \"public.default\", \"color\": \"#FF0000\"}]}");
             // 필요하다면 여기서 초기 글리프(A-Z)를 생성해서 GlyphRepository.save() 호출 가능
        } else {
            throw new IllegalArgumentException("Unknown template: " + templateName);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public Long createProjectFromUfo(Long ownerId, org.springframework.web.multipart.MultipartFile file) {
        try {
            UfoImportService.UfoData data = ufoImportService.parseUfoZip(file, ownerId);
            
            // Save Project
            Long projectId = projectRepository.save(data.project());
            
            // Save Glyphs
            for (com.fontogether.api.model.domain.Glyph glyph : data.glyphs()) {
                glyph.setProjectId(projectId);
                glyphRepository.save(glyph);
            }
            return projectId;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import UFO: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void updateProject(Long userId, Long projectId, String newTitle) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        if (!project.getOwnerId().equals(userId)) {
             throw new SecurityException("You are not authorized to update this project");
        }

        project.setTitle(newTitle);
        projectRepository.update(project);
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (!project.getOwnerId().equals(userId)) {
             throw new SecurityException("Only the owner can delete the project");
        }

        projectRepository.deleteById(projectId);
    }
}
