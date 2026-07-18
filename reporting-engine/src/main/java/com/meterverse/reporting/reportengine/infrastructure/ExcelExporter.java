package com.meterverse.reporting.reportengine.infrastructure;

import com.meterverse.reporting.reportengine.application.ExporterStrategy;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
@Slf4j
public class ExcelExporter implements ExporterStrategy {

    @Override
    public byte[] export(JasperPrint jasperPrint) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            JRXlsxExporter exporter = new JRXlsxExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(baos));

            SimpleXlsxReportConfiguration config = new SimpleXlsxReportConfiguration();
            config.setOnePagePerSheet(false);
            config.setDetectCellType(true);
            config.setIgnoreGraphics(false);
            config.setWhitePageBackground(false);
            config.setMaxRowsPerSheet(100000);
            exporter.setConfiguration(config);

            exporter.exportReport();
            byte[] result = baos.toByteArray();
            log.debug("Excel export completed: {} bytes", result.length);
            return result;
        } catch (JRException e) {
            log.error("Failed to export Excel", e);
            throw new ExportException("Failed to export Excel", e);
        }
    }

    public static class ExportException extends RuntimeException {
        public ExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
