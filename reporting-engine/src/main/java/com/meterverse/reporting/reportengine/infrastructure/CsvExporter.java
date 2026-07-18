package com.meterverse.reporting.reportengine.infrastructure;

import com.meterverse.reporting.reportengine.application.ExporterStrategy;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.JRCsvExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleWriterExporterOutput;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class CsvExporter implements ExporterStrategy {

    @Override
    public byte[] export(JasperPrint jasperPrint) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {

            JRCsvExporter exporter = new JRCsvExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleWriterExporterOutput(writer));

            var config = new net.sf.jasperreports.export.SimpleCsvExporterConfiguration();
            config.setWriteBOM(false);
            config.setFieldDelimiter(",");
            config.setRecordDelimiter("\r\n");
            config.setForcePageBreaks(false);
            exporter.setConfiguration(config);

            exporter.exportReport();
            writer.flush();
            byte[] result = baos.toByteArray();
            log.debug("CSV export completed: {} bytes", result.length);
            return result;
        } catch (JRException e) {
            log.error("Failed to export CSV", e);
            throw new ExportException("Failed to export CSV", e);
        } catch (Exception e) {
            log.error("Unexpected error during CSV export", e);
            throw new ExportException("Unexpected CSV export error", e);
        }
    }

    public static class ExportException extends RuntimeException {
        public ExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
