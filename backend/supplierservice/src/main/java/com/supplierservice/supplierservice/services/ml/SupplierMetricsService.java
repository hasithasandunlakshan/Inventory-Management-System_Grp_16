package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierMetricsService {
    private final SupplierRepository supplierRepository;

    /**
     * Phase 0: log-only (dry-run). In Phase 1 we'll compute & upsert metrics.
     */
    @Transactional(readOnly = true)
    public void computeDailyScores(LocalDate asOf, boolean dryRun) {
        long suppliers = supplierRepository.count();
        log.info("[ETL] asOf={} suppliers={} dryRun={}", asOf, suppliers, dryRun);
        if (dryRun)
            return;

        // Phase 1: we'll actually compute & persist into:
        // - supplier_scores_daily
        // - features_supplier_daily
        // (and capture features_po_at_creation during PO creation)
    }
}
