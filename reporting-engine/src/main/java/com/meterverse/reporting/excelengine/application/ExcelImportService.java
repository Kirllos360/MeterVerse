package com.meterverse.reporting.excelengine.application;

import com.meterverse.reporting.billing.domain.model.Invoice;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@Slf4j
public class ExcelImportService {

    private static final Set<String> REQUIRED_COLUMNS = Set.of(
            "customerCode", "customerName", "utilityType", "consumption"
    );

    public List<Invoice> importInvoices(InputStream excelFile) {
        List<Invoice> invoices = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(excelFile)) {
            Sheet sheet = workbook.getSheetAt(0);
            Map<String, Integer> columnMap = extractColumnHeaders(sheet.getRow(0));

            validateColumns(columnMap);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    Invoice invoice = mapRowToInvoice(row, columnMap);
                    invoices.add(invoice);
                } catch (Exception e) {
                    log.warn("Failed to import row {}: {}", i + 1, e.getMessage());
                }
            }

            log.info("Imported {} invoices from Excel", invoices.size());
        } catch (IOException e) {
            log.error("Failed to read Excel file", e);
            throw new ImportException("Failed to read Excel file", e);
        }
        return invoices;
    }

    public ValidationResult validateExcelTemplate(InputStream excelFile) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(excelFile)) {
            if (workbook.getNumberOfSheets() == 0) {
                errors.add("Excel file has no sheets");
                return new ValidationResult(false, errors, warnings);
            }

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                errors.add("No header row found");
                return new ValidationResult(false, errors, warnings);
            }

            Map<String, Integer> columnMap = extractColumnHeaders(headerRow);

            for (String required : REQUIRED_COLUMNS) {
                if (!columnMap.containsKey(required)) {
                    errors.add("Missing required column: " + required);
                }
            }

            if (sheet.getLastRowNum() > 100000) {
                warnings.add("Large file detected: " + sheet.getLastRowNum() + " rows may impact performance");
            }

        } catch (IOException e) {
            errors.add("Cannot read file: " + e.getMessage());
        }

        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }

    private Map<String, Integer> extractColumnHeaders(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String header = getCellValueAsString(cell).trim().toLowerCase()
                        .replace(" ", "_")
                        .replace("-", "_");
                columnMap.put(header, i);
            }
        }
        return columnMap;
    }

    private void validateColumns(Map<String, Integer> columnMap) {
        List<String> missing = REQUIRED_COLUMNS.stream()
                .filter(c -> !columnMap.containsKey(c))
                .toList();
        if (!missing.isEmpty()) {
            throw new ImportException("Missing required columns: " + missing);
        }
    }

    private Invoice mapRowToInvoice(Row row, Map<String, Integer> columnMap) {
        Invoice.InvoiceBuilder builder = Invoice.builder();

        builder.id(UUID.randomUUID());
        builder.customerCode(getStringCellValue(row, columnMap, "customerCode"));
        builder.customerName(getStringCellValue(row, columnMap, "customerName"));
        builder.customerNameAr(getStringCellValue(row, columnMap, "customerNameAr"));
        builder.utilityType(getStringCellValue(row, columnMap, "utilityType"));
        builder.invoiceNumber(getStringCellValue(row, columnMap, "invoiceNumber"));
        builder.invoiceTitle(getStringCellValue(row, columnMap, "invoiceTitle"));
        builder.status(getStringCellValue(row, columnMap, "status", "PENDING"));
        builder.meterSerial(getStringCellValue(row, columnMap, "meterSerial"));
        builder.meterType(getStringCellValue(row, columnMap, "meterType"));
        builder.projectName(getStringCellValue(row, columnMap, "projectName"));
        builder.areaName(getStringCellValue(row, columnMap, "areaName"));
        builder.unitNumber(getStringCellValue(row, columnMap, "unitNumber"));
        builder.address(getStringCellValue(row, columnMap, "address"));
        builder.billingPeriod(getStringCellValue(row, columnMap, "billingPeriod"));
        builder.unitLabel(getStringCellValue(row, columnMap, "unitLabel", "kWh"));
        builder.currency(getStringCellValue(row, columnMap, "currency", "SAR"));
        builder.companyName(getStringCellValue(row, columnMap, "companyName"));
        builder.companyNameAr(getStringCellValue(row, columnMap, "companyNameAr"));
        builder.companyLicense(getStringCellValue(row, columnMap, "companyLicense"));
        builder.language(getStringCellValue(row, columnMap, "language", "ar"));

        builder.consumption(getNumericCellValue(row, columnMap, "consumption"));
        builder.startReading(getNumericCellValue(row, columnMap, "startReading"));
        builder.endReading(getNumericCellValue(row, columnMap, "endReading"));

        builder.balanceBefore(getBigDecimalCellValue(row, columnMap, "balanceBefore"));
        builder.currentCharges(getBigDecimalCellValue(row, columnMap, "currentCharges"));
        builder.adjustments(getBigDecimalCellValue(row, columnMap, "adjustments"));
        builder.payments(getBigDecimalCellValue(row, columnMap, "payments"));
        builder.balanceAfter(getBigDecimalCellValue(row, columnMap, "balanceAfter"));
        builder.subtotal(getBigDecimalCellValue(row, columnMap, "subtotal"));
        builder.taxAmount(getBigDecimalCellValue(row, columnMap, "taxAmount"));
        builder.totalAmount(getBigDecimalCellValue(row, columnMap, "totalAmount"));

        builder.issueDate(getLocalDateCellValue(row, columnMap, "issueDate"));
        builder.dueDate(getLocalDateCellValue(row, columnMap, "dueDate"));
        builder.generatedAt(Instant.now());

        return builder.build();
    }

    private String getStringCellValue(Row row, Map<String, Integer> colMap, String key) {
        return getStringCellValue(row, colMap, key, null);
    }

    private String getStringCellValue(Row row, Map<String, Integer> colMap, String key, String defaultValue) {
        Integer colIdx = colMap.get(key);
        if (colIdx == null) return defaultValue;
        Cell cell = row.getCell(colIdx);
        return cell != null ? getCellValueAsString(cell) : defaultValue;
    }

    private Double getNumericCellValue(Row row, Map<String, Integer> colMap, String key) {
        Integer colIdx = colMap.get(key);
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    yield null;
                }
            }
            default -> null;
        };
    }

    private BigDecimal getBigDecimalCellValue(Row row, Map<String, Integer> colMap, String key) {
        Double val = getNumericCellValue(row, colMap, key);
        return val != null ? BigDecimal.valueOf(val) : null;
    }

    private LocalDate getLocalDateCellValue(Row row, Map<String, Integer> colMap, String key) {
        Integer colIdx = colMap.get(key);
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        return null;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                }
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    yield cell.getStringCellValue();
                }
            }
            default -> "";
        };
    }

    public record ValidationResult(boolean valid, List<String> errors, List<String> warnings) {}

    public static class ImportException extends RuntimeException {
        public ImportException(String message) {
            super(message);
        }

        public ImportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
