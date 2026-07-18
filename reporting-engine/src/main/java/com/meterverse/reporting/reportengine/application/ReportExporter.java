package com.meterverse.reporting.reportengine.application;

import com.meterverse.reporting.reportengine.domain.ReportFormat;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperPrint;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class ReportExporter {

    private final List<ExporterStrategy> exporterStrategies;
    private final Map<ReportFormat, ExporterStrategy> strategyMap = new EnumMap<>(ReportFormat.class);

    public ReportExporter(List<ExporterStrategy> exporterStrategies) {
        this.exporterStrategies = exporterStrategies;
    }

    @PostConstruct
    void initStrategyMap() {
        exporterStrategies.forEach(strategy -> {
            ReportFormat format = resolveFormat(strategy);
            if (format != null) {
                strategyMap.put(format, strategy);
                log.debug("Registered {} for format {}", strategy.getClass().getSimpleName(), format);
            }
        });
        log.info("ReportExporter initialized with {} export strategies", strategyMap.size());
    }

    private ReportFormat resolveFormat(ExporterStrategy strategy) {
        return switch (strategy.getClass().getSimpleName()) {
            case "PdfExporter" -> ReportFormat.PDF;
            case "ExcelExporter" -> ReportFormat.EXCEL;
            case "DocxExporter" -> ReportFormat.DOCX;
            case "HtmlExporter" -> ReportFormat.HTML;
            case "CsvExporter" -> ReportFormat.CSV;
            default -> null;
        };
    }

    public byte[] export(JasperPrint print, ReportFormat format) {
        ExporterStrategy strategy = strategyMap.get(format);
        if (strategy == null) {
            throw new UnsupportedOperationException("No exporter found for format: " + format);
        }
        log.debug("Exporting report to {} format", format);
        return strategy.export(print);
    }

    public byte[] exportToPdf(JasperPrint print) {
        return export(print, ReportFormat.PDF);
    }

    public byte[] exportToExcel(JasperPrint print) {
        return export(print, ReportFormat.EXCEL);
    }

    public byte[] exportToDocx(JasperPrint print) {
        return export(print, ReportFormat.DOCX);
    }

    public byte[] exportToHtml(JasperPrint print) {
        return export(print, ReportFormat.HTML);
    }

    public byte[] exportToCsv(JasperPrint print) {
        return export(print, ReportFormat.CSV);
    }

    public Map<ReportFormat, ExporterStrategy> getRegisteredStrategies() {
        return Collections.unmodifiableMap(strategyMap);
    }
}
