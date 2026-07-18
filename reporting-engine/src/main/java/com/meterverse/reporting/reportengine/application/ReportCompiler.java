package com.meterverse.reporting.reportengine.application;

import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ReportCompiler {

    private final Map<String, JasperReport> compiledCache = new ConcurrentHashMap<>();

    @Cacheable(value = "compiledReports", key = "#jrxmlPath")
    public JasperReport compileFromFile(String jrxmlPath) {
        try {
            log.info("Compiling JRXML from file: {}", jrxmlPath);
            JasperReport report = JasperCompileManager.compileReport(jrxmlPath);
            compiledCache.put(jrxmlPath, report);
            return report;
        } catch (JRException e) {
            log.error("Failed to compile JRXML file: {}", jrxmlPath, e);
            throw new ReportCompilationException("Failed to compile report: " + jrxmlPath, e);
        }
    }

    public JasperReport compile(InputStream jrxmlStream) {
        try {
            log.info("Compiling JRXML from input stream");
            return JasperCompileManager.compileReport(jrxmlStream);
        } catch (JRException e) {
            log.error("Failed to compile JRXML from stream", e);
            throw new ReportCompilationException("Failed to compile report from stream", e);
        }
    }

    @Cacheable(value = "compiledReports", key = "#jrxmlBytes.hashCode()")
    public JasperReport compile(byte[] jrxmlBytes) {
        try (InputStream is = new ByteArrayInputStream(jrxmlBytes)) {
            return compile(is);
        } catch (IOException e) {
            throw new ReportCompilationException("Failed to read JRXML bytes", e);
        }
    }

    public Map<String, JasperReport> compileAllInDirectory(String dirPath) {
        log.info("Compiling all JRXML files in directory: {}", dirPath);
        Path dir = Paths.get(dirPath);
        if (!Files.exists(dir) || !Files.isDirectory(dir)) {
            throw new ReportCompilationException("Directory not found: " + dirPath);
        }
        try (var files = Files.list(dir)) {
            files.filter(f -> f.toString().endsWith(".jrxml")).forEach(f -> {
                String absPath = f.toAbsolutePath().toString();
                compileFromFile(absPath);
            });
        } catch (IOException e) {
            log.error("Error scanning directory: {}", dirPath, e);
            throw new ReportCompilationException("Error scanning directory: " + dirPath, e);
        }
        return compiledCache;
    }

    public JasperReport getCachedReport(String path) {
        return compiledCache.get(path);
    }

    public void evictCache(String path) {
        compiledCache.remove(path);
    }

    public void clearCache() {
        compiledCache.clear();
    }

    public static class ReportCompilationException extends RuntimeException {
        public ReportCompilationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
