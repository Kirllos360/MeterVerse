package com.meterverse.reporting.reportengine.infrastructure;

import com.meterverse.reporting.reportengine.application.ExporterStrategy;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
@Slf4j
public class DocxExporter implements ExporterStrategy {

    @Override
    public byte[] export(JasperPrint jasperPrint) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            JRDocxExporter exporter = new JRDocxExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(baos));

            var config = new net.sf.jasperreports.export.SimpleDocxReportConfiguration();
            config.setFramesAsNestedTables(true);
            config.setEmbedFonts(true);
            exporter.setConfiguration(config);

            exporter.exportReport();
            byte[] result = baos.toByteArray();
            log.debug("DOCX export completed: {} bytes", result.length);
            return result;
        } catch (JRException e) {
            log.error("Failed to export DOCX", e);
            throw new ExportException("Failed to export DOCX", e);
        }
    }

    public static class ExportException extends RuntimeException {
        public ExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
