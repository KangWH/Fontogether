package com.fontogether.api.repository;

import com.fontogether.api.model.domain.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ProjectRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Project> projectRowMapper = new RowMapper<>() {
        @Override
        public Project mapRow(ResultSet rs, int rowNum) throws SQLException {
            return Project.builder()
                    .projectId(rs.getLong("project_id"))
                    .title(rs.getString("title"))
                    .ownerId(rs.getLong("owner_id"))
                    .metaInfo(rs.getString("meta_info"))
                    .fontInfo(rs.getString("font_info"))
                    .groups(rs.getString("groups"))
                    .kerning(rs.getString("kerning"))
                    .features(rs.getString("features"))
                    .layerConfig(rs.getString("layer_config"))
                    .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                    .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                    .build();
        }
    };

    /**
     * Find all projects where the user is an owner OR a collaborator.
     */
    public List<Project> findAllByUserId(Long userId) {
        String sql = """
            SELECT DISTINCT p.*
            FROM font_project p
            LEFT JOIN project_collaborators pc ON p.project_id = pc.project_id
            WHERE p.owner_id = ? OR pc.user_id = ?
            ORDER BY p.updated_at DESC
        """;
        return jdbcTemplate.query(sql, projectRowMapper, userId, userId);
    }
}
