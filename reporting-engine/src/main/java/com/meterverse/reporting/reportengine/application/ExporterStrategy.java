package com.meterverse.reporting.reportengine.application;

import net.sf.jasperreports.engine.JasperPrint;

public interface ExporterStrategy {

    byte[] export(JasperPrint jasperPrint);
}
