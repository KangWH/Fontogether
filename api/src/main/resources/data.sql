-- 테스트 유저 생성 (비번: password123)
INSERT INTO users (email, password, nickname) 
VALUES ('test@font.com', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt6ValmpBk8O3s5.wKkQz6Fv.aO', 'Seunggwan');

-- 프로젝트 생성
-- 프로젝트 생성
INSERT INTO font_project (owner_id, title) 
VALUES (1, 'My First Font');

-- 'A' 글자 생성 (빈 껍데기)
INSERT INTO glyph (project_id, unicodes, glyph_name) 
VALUES (1, ARRAY['0041'], 'A');