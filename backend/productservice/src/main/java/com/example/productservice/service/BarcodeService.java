package com.example.productservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Service
@RequiredArgsConstructor
public class BarcodeService {

    private final Cloudinary cloudinary;

    public String generateAndUploadBarcode(String barcodeText) {
    try {
        BufferedImage barcodeImage = generateBarcodeImage(barcodeText);

        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ImageIO.write(barcodeImage, "png", os);
        byte[] bytes = os.toByteArray();  // <-- pass bytes, not InputStream

        Map<?, ?> uploadResult = cloudinary.uploader().upload(bytes,
                ObjectUtils.asMap(
                        "folder", "barcodes",
                        "public_id", barcodeText,
                        "resource_type", "image"
                ));

        return uploadResult.get("secure_url").toString();

    } catch (Exception e) {
        throw new RuntimeException("Failed to generate/upload barcode", e);
    }
}

    private BufferedImage generateBarcodeImage(String text) throws Exception {
        int width = 300;
        int height = 100;
        BitMatrix bitMatrix = new MultiFormatWriter().encode(text, BarcodeFormat.CODE_128, width, height);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
    

}
