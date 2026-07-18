package com.meterverse.reporting.reportengine.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequest {

    private String reportName;
    private ReportFormat format;
    private Map<String, Object> parameters;
    private List<UUID> invoiceIds;
    private String language;

    @Builder.Default
    private transient OutputStream outputStream = null;
}
