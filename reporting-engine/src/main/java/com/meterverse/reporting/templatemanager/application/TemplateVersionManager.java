package com.meterverse.reporting.templatemanager.application;

import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import com.meterverse.reporting.templatemanager.domain.TemplateVersion;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TemplateVersionManager {

    private final Map<UUID, List<TemplateVersion>> versionStore = new ConcurrentHashMap<>();

    @Value("${reporting.template.max-versions:50}")
    private int maxVersionsPerTemplate;

    @Transactional
    public TemplateVersion createVersion(ReportTemplate template, String changeLog) {
        List<TemplateVersion> versions = versionStore.computeIfAbsent(template.getId(), k -> new ArrayList<>());

        int nextVersionNumber = versions.isEmpty() ? 1 :
                versions.stream().mapToInt(TemplateVersion::getVersionNumber).max().orElse(0) + 1;

        TemplateVersion version = TemplateVersion.builder()
                .id(UUID.randomUUID())
                .templateId(template.getId())
                .versionNumber(nextVersionNumber)
                .jrxmlContent(template.getJrxmlContent())
                .jasperBytes(template.getJasperBytes())
                .changeLog(changeLog != null ? changeLog : "Version " + nextVersionNumber)
                .createdBy("system")
                .build();

        versions.add(version);

        if (versions.size() > maxVersionsPerTemplate) {
            versions.sort(Comparator.comparingInt(TemplateVersion::getVersionNumber));
            TemplateVersion removed = versions.removeFirst();
            log.info("Removed oldest version {} for template {} (max {})",
                    removed.getVersionNumber(), template.getId(), maxVersionsPerTemplate);
        }

        log.info("Created version {} for template {}", nextVersionNumber, template.getId());
        return version;
    }

    @Transactional(readOnly = true)
    public TemplateVersion getVersion(UUID templateId, int versionNumber) {
        List<TemplateVersion> versions = versionStore.get(templateId);
        if (versions == null || versions.isEmpty()) {
            throw new EntityNotFoundException("No versions found for template: " + templateId);
        }
        return versions.stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Version " + versionNumber + " not found for template: " + templateId));
    }

    @Transactional(readOnly = true)
    public List<TemplateVersion> getVersions(UUID templateId) {
        return versionStore.getOrDefault(templateId, List.of()).stream()
                .sorted(Comparator.comparingInt(TemplateVersion::getVersionNumber).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int getCurrentVersionNumber(UUID templateId) {
        List<TemplateVersion> versions = versionStore.get(templateId);
        if (versions == null || versions.isEmpty()) {
            return 0;
        }
        return versions.stream().mapToInt(TemplateVersion::getVersionNumber).max().orElse(0);
    }

    public void setMaxVersionsPerTemplate(int max) {
        this.maxVersionsPerTemplate = max;
    }

    public int getMaxVersionsPerTemplate() {
        return maxVersionsPerTemplate;
    }
}
