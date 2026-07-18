package com.meterverse.reporting.shared.interfaces.rest;

import com.meterverse.reporting.pdfsecurity.application.PdfSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.KeyStore;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@Slf4j
public class SecurityController {

    private final PdfSecurityService pdfSecurityService;

    @PostMapping("/pdf/protect")
    public ResponseEntity<byte[]> protectPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userPassword", required = false) String userPassword,
            @RequestParam(value = "ownerPassword", required = false) String ownerPassword) throws IOException {

        byte[] pdfBytes = file.getBytes();
        byte[] protectedPdf = pdfSecurityService.protectWithPassword(pdfBytes, userPassword, ownerPassword);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(protectedPdf);
    }

    @PostMapping("/pdf/unprotect")
    public ResponseEntity<byte[]> unprotectPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerPassword") String ownerPassword) throws IOException {

        byte[] unprotectedPdf = pdfSecurityService.removePassword(file.getBytes(), ownerPassword);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(unprotectedPdf);
    }

    @PostMapping("/pdf/disable-editing")
    public ResponseEntity<byte[]> disableEditing(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] result = pdfSecurityService.disableEditing(file.getBytes());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(result);
    }

    @PostMapping("/pdf/disable-copy")
    public ResponseEntity<byte[]> disableCopy(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] result = pdfSecurityService.disableCopy(file.getBytes());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(result);
    }

    @PostMapping("/pdf/watermark")
    public ResponseEntity<byte[]> addWatermark(
            @RequestParam("file") MultipartFile file,
            @RequestParam("text") String watermarkText) throws IOException {

        byte[] result = pdfSecurityService.addWatermark(file.getBytes(), watermarkText);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(result);
    }

    @PostMapping("/pdf/sign")
    public ResponseEntity<byte[]> signPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("keystore") MultipartFile keystoreFile,
            @RequestParam("alias") String alias,
            @RequestParam("password") String password) throws Exception {

        KeyStore ks = KeyStore.getInstance("PKCS12");
        ks.load(keystoreFile.getInputStream(), password.toCharArray());

        byte[] signedPdf = pdfSecurityService.addDigitalSignature(
                file.getBytes(), ks, alias, password);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(signedPdf);
    }
}
