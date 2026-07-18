package com.meterverse.reporting.pdfsecurity.application;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.security.PdfSignatureAppearance;
import com.itextpdf.kernel.pdf.security.PdfSigner;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.signatures.BouncyCastleSignUtils;
import com.itextpdf.signatures.IExternalSignature;
import com.itextpdf.signatures.PrivateKeySignature;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;

@Service
@Slf4j
public class PdfSecurityService {

    public byte[] protectWithPassword(byte[] pdf, String userPassword, String ownerPassword) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf));
             PdfWriter writer = new PdfWriter(baos,
                     new WriterProperties()
                             .setStandardEncryption(
                                     userPassword != null ? userPassword.getBytes() : null,
                                     ownerPassword != null ? ownerPassword.getBytes() : null,
                                     EncryptionConstants.ALLOW_PRINTING,
                                     EncryptionConstants.ENCRYPTION_AES_256))) {

            PdfDocument document = new PdfDocument(reader, writer);
            document.close();

            byte[] result = baos.toByteArray();
            log.info("PDF protected with password ({} bytes)", result.length);
            return result;
        } catch (IOException e) {
            log.error("Failed to protect PDF with password", e);
            throw new PdfSecurityException("Failed to protect PDF", e);
        }
    }

    public byte[] removePassword(byte[] pdf, String ownerPassword) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf),
                     new ReaderProperties().setPassword(ownerPassword != null ? ownerPassword.getBytes() : null));
             PdfWriter writer = new PdfWriter(baos)) {

            PdfDocument document = new PdfDocument(reader, writer);
            document.close();

            byte[] result = baos.toByteArray();
            log.info("Password removed from PDF ({} bytes)", result.length);
            return result;
        } catch (IOException e) {
            log.error("Failed to remove password from PDF", e);
            throw new PdfSecurityException("Failed to remove password", e);
        }
    }

    public byte[] disableEditing(byte[] pdf) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf));
             PdfWriter writer = new PdfWriter(baos,
                     new WriterProperties().setStandardEncryption(
                             null, null,
                             EncryptionConstants.ALLOW_PRINTING | EncryptionConstants.ALLOW_DEGRADED_PRINTING,
                             EncryptionConstants.ENCRYPTION_AES_256))) {

            PdfDocument document = new PdfDocument(reader, writer);
            document.close();

            log.info("Editing disabled on PDF");
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to disable editing on PDF", e);
            throw new PdfSecurityException("Failed to disable editing", e);
        }
    }

    public byte[] disableCopy(byte[] pdf) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf));
             PdfWriter writer = new PdfWriter(baos,
                     new WriterProperties().setStandardEncryption(
                             null, null,
                             EncryptionConstants.ALLOW_PRINTING,
                             EncryptionConstants.ENCRYPTION_AES_256))) {

            PdfDocument document = new PdfDocument(reader, writer);
            document.close();

            log.info("Copy disabled on PDF");
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to disable copy on PDF", e);
            throw new PdfSecurityException("Failed to disable copy", e);
        }
    }

    public byte[] addDigitalSignature(byte[] pdf, KeyStore ks, String alias, String password) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf));
            PdfSigner signer = new PdfSigner(reader, baos, new StampingProperties().useAppendMode());

            PrivateKey key = (PrivateKey) ks.getKey(alias, password.toCharArray());
            Certificate[] chain = ks.getCertificateChain(alias);

            PdfSignatureAppearance appearance = signer.getSignatureAppearance();
            appearance.setReason("Digitally signed by Meter Verse");
            appearance.setLocation("Meter Verse Enterprise");
            appearance.setPageRect(new com.itextpdf.kernel.geom.Rectangle(36, 48, 200, 100));
            appearance.setPageNumber(1);

            IExternalSignature pks = new PrivateKeySignature(key, "SHA-256", "BC");
            signer.signDetached(BouncyCastleSignUtils.getBouncyCastleContainer(), pks, chain, null, null, null, 0, PdfSigner.CryptoStandard.CMS);

            byte[] result = baos.toByteArray();
            log.info("Digital signature added to PDF ({} bytes)", result.length);
            return result;
        } catch (GeneralSecurityException | IOException e) {
            log.error("Failed to add digital signature to PDF", e);
            throw new PdfSecurityException("Failed to add digital signature", e);
        }
    }

    public byte[] addWatermark(byte[] pdf, String watermarkText) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfReader reader = new PdfReader(new java.io.ByteArrayInputStream(pdf));
             PdfWriter writer = new PdfWriter(baos);
             PdfDocument document = new PdfDocument(reader, writer)) {

            PdfFont font = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            int numberOfPages = document.getNumberOfPages();

            for (int i = 1; i <= numberOfPages; i++) {
                PdfPage page = document.getPage(i);
                PdfCanvas canvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), document);

                com.itextpdf.kernel.geom.PageSize pageSize = page.getPageSize();
                float x = pageSize.getWidth() / 2;
                float y = pageSize.getHeight() / 2;

                canvas.saveState()
                        .setFillColor(ColorConstants.LIGHT_GRAY)
                        .setFontAndSize(font, 48)
                        .beginText()
                        .showTextAligned(watermarkText, x, y, TextAlignment.CENTER,
                                (float) Math.toRadians(-45))
                        .endText()
                        .restoreState();
            }

            document.close();
            byte[] result = baos.toByteArray();
            log.info("Watermark '{}' added to PDF ({} pages)", watermarkText, numberOfPages);
            return result;
        } catch (IOException e) {
            log.error("Failed to add watermark to PDF", e);
            throw new PdfSecurityException("Failed to add watermark", e);
        }
    }

    public static class PdfSecurityException extends RuntimeException {
        public PdfSecurityException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
