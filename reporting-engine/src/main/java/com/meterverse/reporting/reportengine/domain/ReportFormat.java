package com.meterverse.reporting.reportengine.domain;

import java.util.Set;

public enum ReportFormat {
    PDF("application/pdf", ".pdf"),
    EXCEL("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"),
    DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"),
    HTML("text/html", ".html"),
    CSV("text/csv", ".csv"),
    XML("application/xml", ".xml");

    private final String mimeType;
    private final String extension;

    ReportFormat(String mimeType, String extension) {
        this.mimeType = mimeType;
        this.extension = extension;
    }

    public String getMimeType() {
        return mimeType;
    }

    public String getExtension() {
        return extension;
    }

    public static Set<ReportFormat> supportedFormats() {
        return Set.of(values());
    }
}
