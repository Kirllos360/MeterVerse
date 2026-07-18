package com.meterverse.reporting.shared.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jasper")
public class JasperProperties {
    private Compiler compiler = new Compiler();
    private Export export = new Export();
    private Cache cache = new Cache();
    private Subreport subreport = new Subreport();
    private Fonts fonts = new Fonts();

    @Data
    public static class Compiler {
        private String tempDirectory = System.getProperty("java.io.tmpdir") + "/jasper-compiled";
        private boolean keepJavaFile = false;
    }

    @Data
    public static class Export {
        private Pdf pdf = new Pdf();
        private Excel excel = new Excel();
        private Html html = new Html();

        @Data
        public static class Pdf {
            private boolean compressed = true;
            private boolean encrypted = false;
            private String permissions = "COPY|PRINT|MODIFY";
            private String fontName = "DejaVu Sans";
            private int fontSize = 7;
            private Arabic arabic = new Arabic();

            @Data
            public static class Arabic {
                private boolean enabled = true;
                private String renderer = "icu4j";
            }
        }

        @Data
        public static class Excel {
            private boolean detectCellType = true;
            private boolean removeEmptySpaceBetweenColumns = true;
            private boolean onePagePerSheet = false;
        }

        @Data
        public static class Html {
            private boolean embeddedImages = true;
            private String css = "classpath:reports/common/style.css";
        }
    }

    @Data
    public static class Cache {
        private boolean compiledReports = true;
        private int maxCacheSize = 500;
        private Resources resources = new Resources();

        @Data
        public static class Resources {
            private int maxAgeSeconds = 3600;
        }
    }

    @Data
    public static class Subreport {
        private String prefix = "classpath:subreports/";
    }

    @Data
    public static class Fonts {
        private String path = "classpath:fonts/";
        private boolean extensions = true;
    }
}
