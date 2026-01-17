package com.fontogether.api.service;

import com.fontogether.api.model.domain.Glyph;
import com.fontogether.api.repository.GlyphRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GlyphService {

    private final GlyphRepository glyphRepository;

    /**
     * 글리프 저장 (Upsert 로직)
     * - 이미 존재하는 글자라면? -> Update
     * - 없는 글자라면? -> Insert
     */
    @Transactional
    public void saveGlyph(Long projectId, String glyphName, String outlineData, Integer width) {
        
        // 1. DB에 이미 있는지 확인 (By Name, not Unicode anymore as primary lookup)
        Optional<Glyph> existing = glyphRepository.findByProjectAndName(projectId, glyphName);

        if (existing.isPresent()) {
            // 2-1. 있으면 업데이트
            Glyph glyph = existing.get();
            glyph.setOutlineData(outlineData);
            glyph.setAdvanceWidth(width);
            
            glyphRepository.update(glyph);
        } else {
            // 2-2. 없으면 새로 생성
            Glyph newGlyph = Glyph.builder()
                    .projectId(projectId)
                    .glyphName(glyphName)
                    .unicodes(List.of()) // 나중에 채워넣음
                    .advanceWidth(width)
                    .advanceHeight(1000) // Default height
                    .layerName("public")
                    .formatVersion(3)
                    .properties("{}")
                    .outlineData(outlineData)
                    .build();
            
            glyphRepository.save(newGlyph);
        }
    }

    /**
     * 글리프 조회
     */
    public Glyph getGlyph(Long projectId, String glyphName) {
        return glyphRepository.findByProjectAndName(projectId, glyphName)
                .orElseGet(() -> Glyph.builder()
                        .projectId(projectId)
                        .glyphName(glyphName)
                        .unicodes(List.of())
                        .advanceWidth(500)
                        .advanceHeight(1000)
                        .layerName("public")
                        .outlineData("{\"contours\":[]}")
                        .build());
    }

    /**
     * 프로젝트의 모든 글리프 조회
     */
    public List<Glyph> getAllGlyphs(Long projectId) {
        return glyphRepository.findAllByProjectId(projectId);
    }
}