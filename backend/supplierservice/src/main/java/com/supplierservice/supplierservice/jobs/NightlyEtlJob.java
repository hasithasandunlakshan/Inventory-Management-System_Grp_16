package com.supplierservice.supplierservice.jobs;

import com.supplierservice.supplierservice.services.ml.SupplierMetricsService;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "jobs.etl", name = "enabled", havingValue = "true")
@Slf4j
public class NightlyEtlJob {

    private final SupplierMetricsService metricsService;

    @Value("${jobs.etl.zone:Asia/Colombo}")
    private String zoneId;

    @Value("${jobs.etl.dry-run:true}")
    private boolean dryRun;

    /**
     * Spring cron has 6 fields: second minute hour day month dayOfWeek
     * Default daily at 02:15 Asia/Colombo
     */
    @Timed(value = "job.etl.nightly.duration", description = "Nightly ETL duration")
    @Scheduled(cron = "${jobs.etl.cron:0 15 2 * * *}", zone = "${jobs.etl.zone:Asia/Colombo}")
    @SchedulerLock(name = "nightlyEtl", lockAtMostFor = "PT2H", lockAtLeastFor = "PT1M")
    public void runNightly() {
        String runId = UUID.randomUUID().toString();
        MDC.put("runId", runId);
        long t0 = System.currentTimeMillis();

        // Process "yesterday" so the day is complete in your timezone
        LocalDate asOf = LocalDate.now(ZoneId.of(zoneId)).minusDays(1);

        log.info("[ETL] START runId={} asOf={} dryRun={}", runId, asOf, dryRun);
        try {
            metricsService.computeDailyScores(asOf, dryRun);
            long ms = System.currentTimeMillis() - t0;
            log.info("[ETL] DONE runId={} tookMs={}", runId, ms);
        } catch (Exception e) {
            log.error("[ETL] FAIL runId={} msg={}", runId, e.getMessage(), e);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
