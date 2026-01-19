package com.fontogether.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fontogether.api.model.domain.Glyph;
import com.fontogether.api.model.domain.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class UfoImportService {

    private final ObjectMapper objectMapper;

    record UfoData(Project project, List<Glyph> glyphs) {}

    public UfoData parseUfoZip(MultipartFile file, Long ownerId) throws Exception {
        Project project = Project.builder()
                .ownerId(ownerId)
                // Default Title, will be overwritten if fontinfo.plist has familyName
                .title("Imported Project") 
                .build();
        
        List<Glyph> glyphs = new ArrayList<>();
        Map<String, byte[]> fileContentMap = new HashMap<>();

        // 1. Read ZIP content into memory map
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;
                String name = entry.getName();
                
                // Read entry content
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    baos.write(buffer, 0, len);
                }
                fileContentMap.put(name, baos.toByteArray());
            }
        }

        // 2. Parse Metadata Files
        // Find root folder prefix if any (e.g., "MyFont.ufo/metainfo.plist")
        String rootPrefix = findRootPrefix(fileContentMap.keySet());
        
        // metainfo.plist
        project.setMetaInfo(parsePlistToJson(fileContentMap.get(rootPrefix + "metainfo.plist")));
        
        // fontinfo.plist
        String fontInfoJson = parsePlistToJson(fileContentMap.get(rootPrefix + "fontinfo.plist"));
        project.setFontInfo(fontInfoJson);
        updateProjectTitleFromFontInfo(project, fontInfoJson);
        
        // groups.plist
        project.setGroups(parsePlistToJson(fileContentMap.get(rootPrefix + "groups.plist")));
        
        // kerning.plist
        project.setKerning(parsePlistToJson(fileContentMap.get(rootPrefix + "kerning.plist")));
        
        // layercontents.plist -> layer_config
        project.setLayerConfig(parseLayerContents(fileContentMap.get(rootPrefix + "layercontents.plist")));
        
        // features.fea
        byte[] featuresBytes = fileContentMap.get(rootPrefix + "features.fea");
        if (featuresBytes != null) {
            project.setFeatures(new String(featuresBytes, StandardCharsets.UTF_8));
        }

        // 3. Parse Glyphs
        // Assume default layer "glyphs" folder for now, or parse layercontents properly
        // For MVP, we scan all .glif files in "glyphs/" directory
        for (String path : fileContentMap.keySet()) {
            if (path.startsWith(rootPrefix + "glyphs/") && path.endsWith(".glif")) {
                Glyph glyph = parseGlif(fileContentMap.get(path));
                if (glyph != null) {
                    glyph.setLayerName("public.default"); // Default layer
                    glyphs.add(glyph);
                }
            }
        }

        return new UfoData(project, glyphs);
    }

    private String findRootPrefix(Set<String> paths) {
        for (String path : paths) {
            if (path.endsWith("metainfo.plist")) {
                return path.substring(0, path.length() - "metainfo.plist".length());
            }
        }
        return "";
    }

    private String parsePlistToJson(byte[] bytes) {
        if (bytes == null) return "{}";
        try {
            // Very basic plist parsing (key-value pairs)
            // Real plist can be complex (nested dicts, arrays). 
            // For MVP, we might treat it as raw XML or use a library, 
            // but strict rules say no new libs. We will try a simple XML to JSON conversion.
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            // Secure processing
            dbFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(new ByteArrayInputStream(bytes));
            
            Element dict = (Element) doc.getElementsByTagName("dict").item(0);
            return convertDictToJson(dict).toString();
        } catch (Exception e) {
            log.warn("Failed to parse plist, returning empty JSON", e);
            return "{}";
        }
    }
    
    private ObjectNode convertDictToJson(Element dict) {
        ObjectNode node = objectMapper.createObjectNode();
        if (dict == null) return node;

        NodeList children = dict.getChildNodes();
        String currentKey = null;

        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeType() != Node.ELEMENT_NODE) continue;
            
            String tagName = child.getNodeName();
            if ("key".equals(tagName)) {
                currentKey = child.getTextContent();
            } else if (currentKey != null) {
                // Value node
                switch (tagName) {
                    case "string" -> node.put(currentKey, child.getTextContent());
                    case "integer" -> node.put(currentKey, Integer.parseInt(child.getTextContent()));
                    case "real" -> node.put(currentKey, Double.parseDouble(child.getTextContent()));
                    case "true" -> node.put(currentKey, true);
                    case "false" -> node.put(currentKey, false);
                    case "array" -> node.set(currentKey, convertArrayToJson((Element) child));
                    case "dict" -> node.set(currentKey, convertDictToJson((Element) child));
                }
                currentKey = null;
            }
        }
        return node;
    }
    
    private ArrayNode convertArrayToJson(Element array) {
        ArrayNode node = objectMapper.createArrayNode();
        NodeList children = array.getChildNodes();
         for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeType() != Node.ELEMENT_NODE) continue;
             String tagName = child.getNodeName();
             switch (tagName) {
                case "string" -> node.add(child.getTextContent());
                case "integer" -> node.add(Integer.parseInt(child.getTextContent()));
                case "real" -> node.add(Double.parseDouble(child.getTextContent()));
                 case "true" -> node.add(true);
                 case "false" -> node.add(false);
                case "array" -> node.add(convertArrayToJson((Element) child));
                case "dict" -> node.add(convertDictToJson((Element) child));
            }
        }
        return node;
    }

    private String parseLayerContents(byte[] bytes) {
        // layercontents.plist is an array of [layerName, dirName]
        // return JSON: {"layers": [{"name": "public.default", "color": "#000000"}]}
        // For MVP, just return a default structure or parse if possible.
        // It's usually small.
        if (bytes == null) return "{\"layers\": [{\"name\": \"public.default\", \"color\": \"#000000\"}]}";
        return parsePlistToJson(bytes); // Reuse generic parser, result will be JSON Array or Object
    }

    private void updateProjectTitleFromFontInfo(Project project, String fontInfoJson) {
        try {
            ObjectNode root = (ObjectNode) objectMapper.readTree(fontInfoJson);
            String familyName = root.has("familyName") ? root.get("familyName").asText() : "";
            String styleName = root.has("styleName") ? root.get("styleName").asText() : "";
            if (!familyName.isEmpty()) {
                project.setTitle(familyName + " " + styleName);
            }
        } catch (Exception e) {
            // ignore
        }
    }

    private Glyph parseGlif(byte[] bytes) {
        try {
             DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
             DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
             Document doc = dBuilder.parse(new ByteArrayInputStream(bytes));
             
             Element glyphElem = doc.getDocumentElement();
             String name = glyphElem.getAttribute("name");
             String format = glyphElem.getAttribute("format");
             
             Glyph glyph = Glyph.builder()
                     .glyphName(name)
                     .formatVersion(format.isEmpty() ? 1 : Integer.parseInt(format))
                     .build();

             // Unicodes
             List<String> unicodes = new ArrayList<>();
             NodeList unicodeNodes = glyphElem.getElementsByTagName("unicode");
             for(int i=0; i<unicodeNodes.getLength(); i++) {
                 Element u = (Element) unicodeNodes.item(i);
                 unicodes.add(u.getAttribute("hex"));
             }
             glyph.setUnicodes(unicodes);
             
             // Advance
             NodeList advanceNodes = glyphElem.getElementsByTagName("advance");
             if (advanceNodes.getLength() > 0) {
                 Element adv = (Element) advanceNodes.item(0);
                 if (adv.hasAttribute("width")) glyph.setAdvanceWidth(Integer.parseInt(adv.getAttribute("width")));
                 if (adv.hasAttribute("height")) glyph.setAdvanceHeight(Integer.parseInt(adv.getAttribute("height")));
             }
             
             // Outline Data -> Convert XML outline to JSON structure for frontend
             Element outline = (Element) glyphElem.getElementsByTagName("outline").item(0);
             if (outline != null) {
                 glyph.setOutlineData(convertOutlineToJson(outline));
             } else {
                 glyph.setOutlineData("{}");
             }
             
             glyph.setProperties("{}"); // Simplification for now
             
             return glyph;

        } catch (Exception e) {
            log.error("Failed to parse glif", e);
            return null;
        }
    }

    private String convertOutlineToJson(Element outline) {
        // Convert <contour>, <component> to JSON
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contours = objectMapper.createArrayNode();
        ArrayNode components = objectMapper.createArrayNode();

        NodeList children = outline.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeType() != Node.ELEMENT_NODE) continue;
            
            if ("contour".equals(child.getNodeName())) {
                ArrayNode points = objectMapper.createArrayNode();
                NodeList pointNodes = child.getChildNodes();
                 for (int j = 0; j < pointNodes.getLength(); j++) {
                     Node pNode = pointNodes.item(j);
                     if (pNode.getNodeType() == Node.ELEMENT_NODE && "point".equals(pNode.getNodeName())) {
                         Element p = (Element) pNode;
                         ObjectNode pointObj = objectMapper.createObjectNode();
                         pointObj.put("x", Double.parseDouble(p.getAttribute("x")));
                         pointObj.put("y", Double.parseDouble(p.getAttribute("y")));
                         if(p.hasAttribute("type")) pointObj.put("type", p.getAttribute("type"));
                         if(p.hasAttribute("smooth")) pointObj.put("smooth", "yes".equals(p.getAttribute("smooth")));
                         points.add(pointObj);
                     }
                 }
                 ObjectNode contourObj = objectMapper.createObjectNode();
                 contourObj.set("points", points);
                 contours.add(contourObj);
            } else if ("component".equals(child.getNodeName())) {
                Element cmp = (Element) child;
                ObjectNode compObj = objectMapper.createObjectNode();
                compObj.put("base", cmp.getAttribute("base"));
                if(cmp.hasAttribute("xScale")) compObj.put("xScale", Double.parseDouble(cmp.getAttribute("xScale")));
                if(cmp.hasAttribute("xyScale")) compObj.put("xyScale", Double.parseDouble(cmp.getAttribute("xyScale")));
                if(cmp.hasAttribute("yxScale")) compObj.put("yxScale", Double.parseDouble(cmp.getAttribute("yxScale")));
                if(cmp.hasAttribute("yScale")) compObj.put("yScale", Double.parseDouble(cmp.getAttribute("yScale")));
                if(cmp.hasAttribute("xOffset")) compObj.put("xOffset", Double.parseDouble(cmp.getAttribute("xOffset")));
                if(cmp.hasAttribute("yOffset")) compObj.put("yOffset", Double.parseDouble(cmp.getAttribute("yOffset")));
                components.add(compObj);
            }
        }
        
        root.set("contours", contours);
        root.set("components", components);
        return root.toString();
    }
}
