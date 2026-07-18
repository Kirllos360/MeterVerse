package com.meterverse.reporting.templatemanager.application;

import com.meterverse.reporting.reportengine.application.ReportCompiler;
import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import com.meterverse.reporting.templatemanager.domain.TemplateAsset;
import com.meterverse.reporting.templatemanager.domain.TemplateVersion;
import com.meterverse.reporting.templatemanager.domain.repository.ReportTemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TemplateService {

    private final ReportTemplateRepository templateRepository;
    private final TemplateVersionManager versionManager;
    private final ReportCompiler reportCompiler;

    @Transactional
    public ReportTemplate createTemplate(ReportTemplate template) {
        if (templateRepository.existsByCode(template.getCode())) {
            throw new ValidationException("Template code already exists: " + template.getCode());
        }
        if (template.getJrxmlContent() != null && !template.getJrxmlContent().isBlank()) {
            try {
                byte[] jasperBytes = reportCompiler.compile(
                        new ByteArrayInputStream(template.getJrxmlContent().getBytes())).serialize();
                template.setJasperBytes(jasperBytes);
            } catch (Exception e) {
                log.warn("Template created without compiling JRXML: {}", e.getMessage());
            }
        }
        ReportTemplate saved = templateRepository.save(template);
        versionManager.createVersion(saved, "Initial version");
        log.info("Template created: {} ({})", saved.getName(), saved.getCode());
        return saved;
    }

    @Transactional
    public ReportTemplate updateTemplate(UUID id, ReportTemplate updated) {
        ReportTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + id));

        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getUtilityType() != null) existing.setUtilityType(updated.getUtilityType());
        if (updated.getParametersJson() != null) existing.setParametersJson(updated.getParametersJson());
        if (updated.getStylesJson() != null) existing.setStylesJson(updated.getStylesJson());

        if (updated.getJrxmlContent() != null && !updated.getJrxmlContent().isBlank()) {
            existing.setJrxmlContent(updated.getJrxmlContent());
            try {
                byte[] jasperBytes = reportCompiler.compile(
                        new ByteArrayInputStream(updated.getJrxmlContent().getBytes())).serialize();
                existing.setJasperBytes(jasperBytes);
            } catch (Exception e) {
                log.warn("Failed to recompile JRXML on update: {}", e.getMessage());
            }
        }

        existing = templateRepository.save(existing);
        versionManager.createVersion(existing, "Updated template");
        log.info("Template updated: {} ({})", existing.getName(), existing.getCode());
        return existing;
    }

    @Transactional
    public ReportTemplate activateVersion(UUID templateId, int targetVersionNumber) {
        TemplateVersion version = versionManager.getVersion(templateId, targetVersionNumber);
        ReportTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + templateId));

        template.setJrxmlContent(version.getJrxmlContent());
        template.setJasperBytes(version.getJasperBytes());
        template = templateRepository.save(template);

        log.info("Template {} activated to version {}", templateId, targetVersionNumber);
        return template;
    }

    @Transactional(readOnly = true)
    public ReportTemplate getActiveTemplate(String utilityType) {
        List<ReportTemplate> templates = templateRepository.findByUtilityTypeAndIsActive(utilityType, true);
        if (templates.isEmpty()) {
            throw new EntityNotFoundException("No active template found for utilityType: " + utilityType);
        }
        return templates.getFirst();
    }

    @Transactional(readOnly = true)
    public List<TemplateVersion> getTemplateVersions(UUID templateId) {
        return versionManager.getVersions(templateId);
    }

    @Transactional
    public TemplateAsset uploadAsset(UUID templateId, TemplateAsset asset, byte[] content) {
        if (!templateRepository.existsById(templateId)) {
            throw new EntityNotFoundException("Template not found: " + templateId);
        }
        asset.setTemplateId(templateId);
        asset.setContent(content);
        asset.setFileSize(content.length);
        asset.setChecksum(computeChecksum(content));
        log.info("Asset uploaded: {} for template {}", asset.getName(), templateId);
        return asset;
    }

    @Transactional(readOnly = true)
    public TemplateAsset getAsset(UUID templateId, UUID assetId) {
        return null;
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        if (!templateRepository.existsById(id)) {
            throw new EntityNotFoundException("Template not found: " + id);
        }
        templateRepository.deleteById(id);
        log.info("Template deleted: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ReportTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ReportTemplate getTemplateById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + id));
    }

    private String computeChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
