package com.supplierservice.supplierservice.jobs;

import com.supplierservice.supplierservice.services.ml.SupplierMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupplierMetricsJob {
    private final SupplierMetricsService metricsService;

    // 2:00 AM daily
    @Scheduled(cron = "0 0 2 * * *")
    public void runNightly() {
        long t0 = System.currentTimeMillis();
        try {
            metricsService.computeDailyScores();
            log.info("SupplierMetricsJob finished in {} ms", System.currentTimeMillis() - t0);
        } catch (Exception e) {
            log.error("SupplierMetricsJob failed", e);
        }
    }
}
