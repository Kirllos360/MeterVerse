package com.meterverse.reporting.excelengine.application;

import com.meterverse.reporting.billing.domain.model.Invoice;
import com.meterverse.reporting.billing.domain.model.InvoiceChargeLine;
import lombok.extern.slf4j.Slf4j;
import org.jxls.common.Context;
import org.jxls.transform.poi.PoiTransformer;
import org.jxls.util.JxlsHelper;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;

@Service
@Slf4j
public class JxlsService {

    public byte[] generateExcel(String templatePath, Map<String, Object> data) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            generateExcel(templatePath, data, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to generate Excel from template: {}", templatePath, e);
            throw new ExcelGenerationException("Failed to generate Excel", e);
        }
    }

    public void generateExcel(String templatePath, Map<String, Object> data, OutputStream out) {
        try (InputStream is = new FileInputStream(templatePath)) {
            Context context = PoiTransformer.createInitialContext();
            data.forEach(context::putVar);

            JxlsHelper jxlsHelper = JxlsHelper.getInstance();
            jxlsHelper.setEvaluateFormulas(true);
            jxlsHelper.setUseFastFormulaProcessor(false);
            jxlsHelper.processTemplate(is, out, context);

            log.debug("Excel generated from template: {} with {} data vars", templatePath, data.size());
        } catch (IOException e) {
            log.error("Failed to read template: {}", templatePath, e);
            throw new ExcelGenerationException("Failed to read Excel template", e);
        } catch (Exception e) {
            log.error("JXLS processing failed for template: {}", templatePath, e);
            throw new ExcelGenerationException("JXLS processing failed", e);
        }
    }

    public byte[] generateInvoiceExcel(Invoice invoice) {
        try {
            Map<String, Object> data = buildInvoiceData(invoice);
            String templatePath = resolveTemplatePath(invoice.getUtilityType());
            return generateExcel(templatePath, data);
        } catch (Exception e) {
            log.error("Failed to generate invoice Excel for: {}", invoice.getInvoiceNumber(), e);
            throw new ExcelGenerationException("Failed to generate invoice Excel", e);
        }
    }

    public byte[] generateBatchExcel(List<Invoice> invoices) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("invoices", invoices);
            data.put("invoiceCount", invoices.size());
            data.put("generatedAt", new Date());
            data.put("totalAmount", invoices.stream()
                    .map(Invoice::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));

            String templatePath = "templates/excel/batch_invoice_template.xlsx";
            return generateExcel(templatePath, data);
        } catch (Exception e) {
            log.error("Failed to generate batch Excel for {} invoices", invoices.size(), e);
            throw new ExcelGenerationException("Failed to generate batch Excel", e);
        }
    }

    private Map<String, Object> buildInvoiceData(Invoice invoice) {
        Map<String, Object> data = new HashMap<>();
        data.put("invoiceNumber", invoice.getInvoiceNumber());
        data.put("invoiceTitle", invoice.getInvoiceTitle());
        data.put("utilityType", invoice.getUtilityType());
        data.put("customerCode", invoice.getCustomerCode());
        data.put("customerName", invoice.getCustomerName());
        data.put("customerNameAr", invoice.getCustomerNameAr());
        data.put("meterSerial", invoice.getMeterSerial());
        data.put("meterType", invoice.getMeterType());
        data.put("projectName", invoice.getProjectName());
        data.put("areaName", invoice.getAreaName());
        data.put("unitNumber", invoice.getUnitNumber());
        data.put("address", invoice.getAddress());
        data.put("issueDate", invoice.getIssueDate());
        data.put("dueDate", invoice.getDueDate());
        data.put("billingPeriod", invoice.getBillingPeriod());
        data.put("consumption", invoice.getConsumption());
        data.put("unitLabel", invoice.getUnitLabel());
        data.put("balanceBefore", invoice.getBalanceBefore());
        data.put("currentCharges", invoice.getCurrentCharges());
        data.put("adjustments", invoice.getAdjustments());
        data.put("payments", invoice.getPayments());
        data.put("balanceAfter", invoice.getBalanceAfter());
        data.put("subtotal", invoice.getSubtotal());
        data.put("taxAmount", invoice.getTaxAmount());
        data.put("totalAmount", invoice.getTotalAmount());
        data.put("currency", invoice.getCurrency());
        data.put("companyName", invoice.getCompanyName());
        data.put("companyNameAr", invoice.getCompanyNameAr());
        data.put("companyLicense", invoice.getCompanyLicense());
        data.put("generatedAt", new Date());
        return data;
    }

    private String resolveTemplatePath(String utilityType) {
        if ("ELECTRICITY".equalsIgnoreCase(utilityType)) {
            return "templates/excel/electricity_invoice_template.xlsx";
        } else if ("WATER".equalsIgnoreCase(utilityType)) {
            return "templates/excel/water_invoice_template.xlsx";
        }
        return "templates/excel/invoice_template.xlsx";
    }

    public static class ExcelGenerationException extends RuntimeException {
        public ExcelGenerationException(String message) {
            super(message);
        }

        public ExcelGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
