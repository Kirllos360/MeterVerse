package com.meterverse.reporting.reportengine.application;

import com.meterverse.reporting.billing.domain.model.Invoice;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReportFiller {

    private final MessageSource messageSource;

    public ReportFiller(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public JasperPrint fill(JasperReport report, Map<String, Object> params, Connection dataSource) {
        try {
            log.debug("Filling report with database connection");
            return JasperFillManager.fillReport(report, params, dataSource);
        } catch (JRException e) {
            log.error("Failed to fill report with connection", e);
            throw new ReportFillException("Failed to fill report", e);
        }
    }

    public JasperPrint fill(JasperReport report, Map<String, Object> params, DataSource dataSource) {
        try (Connection conn = dataSource.getConnection()) {
            return fill(report, params, conn);
        } catch (SQLException e) {
            log.error("Failed to obtain database connection", e);
            throw new ReportFillException("Failed to obtain database connection", e);
        }
    }

    public JasperPrint fillFromInvoice(Invoice invoice, JasperReport report) {
        try {
            Map<String, Object> params = buildInvoiceParams(invoice);
            List<Invoice> invoiceList = List.of(invoice);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(invoiceList);
            log.debug("Filling report for invoice: {}", invoice.getInvoiceNumber());
            return JasperFillManager.fillReport(report, params, dataSource);
        } catch (JRException e) {
            log.error("Failed to fill report for invoice: {}", invoice.getInvoiceNumber(), e);
            throw new ReportFillException("Failed to fill report for invoice", e);
        }
    }

    public JasperPrint fillFromInvoices(List<Invoice> invoices, JasperReport report) {
        try {
            if (invoices == null || invoices.isEmpty()) {
                throw new ReportFillException("No invoices provided for report filling");
            }
            Map<String, Object> params = buildInvoiceParams(invoices.getFirst());
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(invoices);
            log.debug("Filling report with {} invoices", invoices.size());
            return JasperFillManager.fillReport(report, params, dataSource);
        } catch (JRException e) {
            log.error("Failed to fill report for batch", e);
            throw new ReportFillException("Failed to fill batch report", e);
        }
    }

    public JasperPrint fillWithCollection(JasperReport report, Map<String, Object> params,
                                           Collection<?> data, String language) {
        try {
            Locale locale = resolveLocale(language);
            Map<String, Object> filledParams = new HashMap<>(params);
            filledParams.put(JRParameter.REPORT_LOCALE, locale);
            filledParams.put(JRParameter.REPORT_RESOURCE_BUNDLE,
                    messageSource.getMessage("report.title", null, locale));

            JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(data);
            return JasperFillManager.fillReport(report, filledParams, ds);
        } catch (JRException e) {
            log.error("Failed to fill report with collection", e);
            throw new ReportFillException("Failed to fill report with collection data", e);
        }
    }

    private Map<String, Object> buildInvoiceParams(Invoice invoice) {
        Map<String, Object> params = new HashMap<>();
        params.put("INVOICE_ID", invoice.getId().toString());
        params.put("INVOICE_NUMBER", invoice.getInvoiceNumber());
        params.put("INVOICE_TITLE", invoice.getInvoiceTitle());
        params.put("UTILITY_TYPE", invoice.getUtilityType());
        params.put("STATUS", invoice.getStatus());
        params.put("CUSTOMER_CODE", invoice.getCustomerCode());
        params.put("CUSTOMER_NAME", invoice.getCustomerName());
        params.put("CUSTOMER_NAME_AR", invoice.getCustomerNameAr());
        params.put("METER_SERIAL", invoice.getMeterSerial());
        params.put("METER_TYPE", invoice.getMeterType());
        params.put("PROJECT_NAME", invoice.getProjectName());
        params.put("AREA_NAME", invoice.getAreaName());
        params.put("UNIT_NUMBER", invoice.getUnitNumber());
        params.put("ADDRESS", invoice.getAddress());
        params.put("ISSUE_DATE", invoice.getIssueDate());
        params.put("DUE_DATE", invoice.getDueDate());
        params.put("BILLING_PERIOD", invoice.getBillingPeriod());
        params.put("START_READING", invoice.getStartReading());
        params.put("END_READING", invoice.getEndReading());
        params.put("CONSUMPTION", invoice.getConsumption());
        params.put("UNIT_LABEL", invoice.getUnitLabel());
        params.put("BALANCE_BEFORE", invoice.getBalanceBefore());
        params.put("CURRENT_CHARGES", invoice.getCurrentCharges());
        params.put("ADJUSTMENTS", invoice.getAdjustments());
        params.put("PAYMENTS", invoice.getPayments());
        params.put("BALANCE_AFTER", invoice.getBalanceAfter());
        params.put("SUBTOTAL", invoice.getSubtotal());
        params.put("TAX_AMOUNT", invoice.getTaxAmount());
        params.put("TOTAL_AMOUNT", invoice.getTotalAmount());
        params.put("CURRENCY", invoice.getCurrency());
        params.put("COMPANY_NAME", invoice.getCompanyName());
        params.put("COMPANY_NAME_AR", invoice.getCompanyNameAr());
        params.put("COMPANY_LICENSE", invoice.getCompanyLicense());
        params.put("LANGUAGE", invoice.getLanguage());

        params.put("REPORT_LOCALE", resolveLocale(invoice.getLanguage()));
        params.put("SUBREPORT_DIR", "reports/");

        return params;
    }

    private Locale resolveLocale(String language) {
        if ("ar".equalsIgnoreCase(language)) {
            return new Locale.Builder().setLanguage("ar").setRegion("EG").build();
        }
        return Locale.ENGLISH;
    }

    public static class ReportFillException extends RuntimeException {
        public ReportFillException(String message) {
            super(message);
        }

        public ReportFillException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
