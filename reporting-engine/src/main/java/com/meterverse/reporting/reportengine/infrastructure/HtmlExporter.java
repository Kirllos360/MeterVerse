package com.meterverse.reporting.reportengine.infrastructure;

import com.meterverse.reporting.reportengine.application.ExporterStrategy;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.HtmlExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleHtmlExporterOutput;
import net.sf.jasperreports.export.SimpleHtmlReportConfiguration;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;

@Component
@Slf4j
public class HtmlExporter implements ExporterStrategy {

    @Override
    public byte[] export(JasperPrint jasperPrint) {
        try (StringWriter writer = new StringWriter()) {
            HtmlExporter exporter = new HtmlExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleHtmlExporterOutput(writer));

            SimpleHtmlReportConfiguration config = new SimpleHtmlReportConfiguration();
            config.setRemoveEmptySpaceBetweenColumns(true);
            config.setRemoveEmptySpaceBetweenRows(true);
            config.setWhitePageBackground(false);
            config.setWrapBreakWord(true);
            config.setFramesAsNestedTables(true);
            exporter.setConfiguration(config);

            exporter.exportReport();
            byte[] result = writer.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
            log.debug("HTML export completed: {} bytes", result.length);
            return result;
        } catch (JRException e) {
            log.error("Failed to export HTML", e);
            throw new ExportException("Failed to export HTML", e);
        } catch (Exception e) {
            log.error("Unexpected error during HTML export", e);
            throw new ExportException("Unexpected HTML export error", e);
        }
    }

    public static class ExportException extends RuntimeException {
        public ExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
