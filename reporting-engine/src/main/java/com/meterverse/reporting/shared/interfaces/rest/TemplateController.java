package com.meterverse.reporting.shared.interfaces.rest;

import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import com.meterverse.reporting.templatemanager.domain.TemplateAsset;
import com.meterverse.reporting.templatemanager.domain.TemplateVersion;
import com.meterverse.reporting.templatemanager.application.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Slf4j
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<ReportTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportTemplate> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PostMapping
    public ResponseEntity<ReportTemplate> createTemplate(@RequestBody ReportTemplate template) {
        ReportTemplate created = templateService.createTemplate(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportTemplate> updateTemplate(
            @PathVariable UUID id,
            @RequestBody ReportTemplate template) {
        return ResponseEntity.ok(templateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<ReportTemplate> getActiveTemplate(
            @RequestParam String utilityType) {
        return ResponseEntity.ok(templateService.getActiveTemplate(utilityType));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<TemplateVersion>> getVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getTemplateVersions(id));
    }

    @PostMapping("/{id}/versions/{versionNumber}/activate")
    public ResponseEntity<ReportTemplate> activateVersion(
            @PathVariable UUID id,
            @PathVariable int versionNumber) {
        return ResponseEntity.ok(templateService.activateVersion(id, versionNumber));
    }

    @PostMapping("/{id}/assets")
    public ResponseEntity<TemplateAsset> uploadAsset(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") TemplateAsset.AssetType type,
            @RequestParam("name") String name) throws IOException {

        TemplateAsset asset = TemplateAsset.builder()
                .type(type)
                .name(name)
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();

        TemplateAsset saved = templateService.uploadAsset(id, asset, file.getBytes());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{templateId}/assets/{assetId}")
    public ResponseEntity<byte[]> getAsset(
            @PathVariable UUID templateId,
            @PathVariable UUID assetId) {
        TemplateAsset asset = templateService.getAsset(templateId, assetId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(asset.getMimeType()))
                .body(asset.getContent());
    }
}
