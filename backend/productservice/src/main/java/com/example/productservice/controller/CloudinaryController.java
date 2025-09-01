package com.example.productservice.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {
    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/signature")
    public Map<String, Object> getSignature() {
        long timestamp = System.currentTimeMillis() / 1000;
        String signature = cloudinary.apiSignRequest(
                ObjectUtils.asMap("timestamp", timestamp), cloudinary.config.apiSecret);

        return Map.of(
                "timestamp", timestamp,
                "signature", signature,
                "apiKey", cloudinary.config.apiKey,
                "cloudName", cloudinary.config.cloudName);
    }

}
