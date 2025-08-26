package com.supplierservice.supplierservice.controllers.internal;

import com.supplierservice.supplierservice.services.ml.SupplierMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;

@RestController
@RequestMapping("/internal/jobs")
@RequiredArgsConstructor
public class JobController {

    private final SupplierMetricsService metricsService;

    @PostMapping("/etl/run")
    public ResponseEntity<String> runOnce(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "true") boolean dryRun,
            @RequestParam(defaultValue = "Asia/Colombo") String zone) {

        LocalDate asOf = (date != null) ? date : LocalDate.now(ZoneId.of(zone)).minusDays(1);
        metricsService.computeDailyScores(asOf, dryRun);
        return ResponseEntity.ok("Triggered ETL for " + asOf + " dryRun=" + dryRun);
    }
}
