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

    @Transactional(readOnly = true)
    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findAllByUserId(userId);
    }
}
