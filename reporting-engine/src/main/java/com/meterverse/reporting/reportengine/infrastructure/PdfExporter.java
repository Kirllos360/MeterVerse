package com.meterverse.reporting.reportengine.infrastructure;

import com.meterverse.reporting.reportengine.application.ExporterStrategy;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
@Slf4j
public class PdfExporter implements ExporterStrategy {

    @Override
    public byte[] export(JasperPrint jasperPrint) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            JRPdfExporter exporter = new JRPdfExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(baos));

            var configuration = new net.sf.jasperreports.export.SimplePdfExporterConfiguration();
            configuration.setCompressed(true);
            configuration.setTagLanguage(net.sf.jasperreports.export.SimplePdfExporterConfiguration.LANGUAGE_ARABIC);
            exporter.setConfiguration(configuration);

            exporter.exportReport();
            byte[] result = baos.toByteArray();
            log.debug("PDF export completed: {} bytes", result.length);
            return result;
        } catch (JRException e) {
            log.error("Failed to export PDF", e);
            throw new ExportException("Failed to export PDF", e);
        } catch (Exception e) {
            log.error("Unexpected error during PDF export", e);
            throw new ExportException("Unexpected PDF export error", e);
        }
    }

    public static class ExportException extends RuntimeException {
        public ExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
