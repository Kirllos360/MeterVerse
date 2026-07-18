package com.meterverse.reporting.shared.config;

import com.meterverse.reporting.shared.config.properties.JasperProperties;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.DefaultJasperReportsContext;
import net.sf.jasperreports.engine.JasperReportsContext;
import net.sf.jasperreports.engine.SimpleJasperReportsContext;
import net.sf.jasperreports.engine.fonts.FontExtensionsRegistry;
import net.sf.jasperreports.engine.util.JRFontNotFoundException;
import net.sf.jasperreports.engine.xml.JRXmlDigesterFactory;
import net.sf.jasperreports.repo.FileRepositoryPersistenceServiceFactory;
import net.sf.jasperreports.repo.FileRepositoryService;
import net.sf.jasperreports.repo.PersistenceServiceFactory;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;

import java.io.File;

@Configuration
@RequiredArgsConstructor
public class JasperConfig {

    private final JasperProperties properties;
    private final ResourceLoader resourceLoader;

    @Bean
    public JasperReportsContext jasperReportsContext() {
        var ctx = new SimpleJasperReportsContext();
        ctx.setProperty("net.sf.jasperreports.awt.ignore.missing.font", "true");
        ctx.setProperty("net.sf.jasperreports.default.font.name", properties.getExport().getPdf().getFontName());
        ctx.setProperty("net.sf.jasperreports.default.font.size",
                String.valueOf(properties.getExport().getPdf().getFontSize()));
        ctx.setProperty("net.sf.jasperreports.export.parameters.force.screen.font", "true");
        ctx.setProperty("net.sf.jasperreports.components.axis.padding", "0");
        ctx.setProperty("net.sf.jasperreports.xls.detect.cell.type",
                String.valueOf(properties.getExport().getExcel().isDetectCellType()));
        ctx.setProperty("net.sf.jasperreports.export.xls.remove.empty.space.between.columns",
                String.valueOf(properties.getExport().getExcel().isRemoveEmptySpaceBetweenColumns()));
        ctx.setProperty("net.sf.jasperreports.export.pdf.compressed",
                String.valueOf(properties.getExport().getPdf().isCompressed()));
        ctx.setProperty("net.sf.jasperreports.export.pdf.encrypted",
                String.valueOf(properties.getExport().getPdf().isEncrypted()));
        ctx.setProperty("net.sf.jasperreports.export.pdf.permissions", properties.getExport().getPdf().getPermissions());
        ctx.setProperty("net.sf.jasperreports.export.pdf.force.linebreak.policy", "true");

        if (properties.getExport().getPdf().getArabic().isEnabled()) {
            ctx.setProperty("net.sf.jasperreports.export.pdf.rtl.encoding", "true");
            ctx.setProperty("net.sf.jasperreports.export.pdf.arabic.renderer", "icu4j");
        }

        var fontsDir = new File(properties.getFonts().getPath());
        if (fontsDir.exists()) {
            ctx.setProperty("net.sf.jasperreports.extensions.registry", FontExtensionsRegistry.class.getName());
            System.setProperty("jasper.reports.fonts.dir", fontsDir.getAbsolutePath());
        }

        return ctx;
    }

    @Bean
    public FileRepositoryService fileRepositoryService(JasperReportsContext context) {
        var reportsDir = new File("compiled");
        if (!reportsDir.exists()) reportsDir.mkdirs();
        return new FileRepositoryService(context, reportsDir.getAbsolutePath(), false);
    }
}
