package com.fontogether.api.repository;

import com.fontogether.api.model.domain.Glyph;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class GlyphRepository {

    private final JdbcTemplate jdbcTemplate;

    public GlyphRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. RowMapper
    private final RowMapper<Glyph> glyphRowMapper = (rs, rowNum) -> {
        // Handle potentially null arrays
        java.sql.Array unicodesArray = rs.getArray("unicodes");
        List<String> unicodeList = List.of();
        if (unicodesArray != null) {
            String[] arr = (String[]) unicodesArray.getArray();
            unicodeList = List.of(arr);
        }

        return Glyph.builder()
            .glyphUuid((java.util.UUID) rs.getObject("glyph_uuid"))
            .projectId(rs.getLong("project_id"))
            .layerName(rs.getString("layer_name"))
            .glyphName(rs.getString("glyph_name"))
            .formatVersion(rs.getInt("format_version"))
            .unicodes(unicodeList)
            .advanceWidth(rs.getInt("advance_width"))
            .advanceHeight(rs.getInt("advance_height"))
            .outlineData(rs.getString("outline_data"))
            .properties(rs.getString("properties"))
            .lastModifiedBy(rs.getString("last_modified_by"))
            .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
            .build();
    };

    // 2. 저장 (INSERT)
    public java.util.UUID save(Glyph glyph) {
        String sql = """
                INSERT INTO glyph (project_id, layer_name, glyph_name, unicodes, advance_width, advance_height, outline_data, properties, last_modified_by)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"glyph_uuid"});
            ps.setLong(1, glyph.getProjectId());
            ps.setString(2, glyph.getLayerName());
            ps.setString(3, glyph.getGlyphName());
            
            // Handle Array mapping
            String[] unicodeArr = glyph.getUnicodes() != null ? glyph.getUnicodes().toArray(new String[0]) : new String[0];
            java.sql.Array sqlArray = connection.createArrayOf("varchar", unicodeArr);
            ps.setArray(4, sqlArray);
            
            ps.setInt(5, glyph.getAdvanceWidth());
            ps.setInt(6, glyph.getAdvanceHeight());
            ps.setString(7, glyph.getOutlineData());
            ps.setString(8, glyph.getProperties());
            ps.setString(9, glyph.getLastModifiedBy());
            return ps;
        }, keyHolder);

        return (java.util.UUID) keyHolder.getKeys().get("glyph_uuid");
    }

    // 3. 조회
    public Optional<Glyph> findByProjectAndName(Long projectId, String glyphName) {
        String sql = "SELECT * FROM glyph WHERE project_id = ? AND glyph_name = ?";
        List<Glyph> results = jdbcTemplate.query(sql, glyphRowMapper, projectId, glyphName);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<Glyph> findAllByProjectId(Long projectId) {
        String sql = "SELECT * FROM glyph WHERE project_id = ? ORDER BY glyph_name ASC";
        return jdbcTemplate.query(sql, glyphRowMapper, projectId);
    }
    
    // 4. 업데이트
    public void update(Glyph glyph) {
        String sql = """
                UPDATE glyph 
                SET glyph_name = ?, advance_width = ?, advance_height = ?, outline_data = ?::jsonb, properties = ?::jsonb, last_modified_by = ?, updated_at = NOW()
                WHERE glyph_uuid = ?
                """;
        
        jdbcTemplate.update(sql,
                glyph.getGlyphName(),
                glyph.getAdvanceWidth(),
                glyph.getAdvanceHeight(),
                glyph.getOutlineData(),
                glyph.getProperties(),
                glyph.getLastModifiedBy(),
                glyph.getGlyphUuid()
        );
    }
    
    // 5. 삭제
    public void delete(Glyph glyph) {
        String sql = "DELETE FROM glyph WHERE glyph_uuid = ?";
        jdbcTemplate.update(sql, glyph.getGlyphUuid());
    }
}