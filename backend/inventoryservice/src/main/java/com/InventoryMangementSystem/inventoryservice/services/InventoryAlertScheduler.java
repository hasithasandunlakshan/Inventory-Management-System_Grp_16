package com.InventoryMangementSystem.inventoryservice.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InventoryAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(InventoryAlertScheduler.class);

    private final InventoryService inventoryService;

    public InventoryAlertScheduler(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Every 5 minutes
    @Scheduled(fixedDelay = 300_000, initialDelay = 60_000)
    public void scan() {
        log.debug("Running scheduled inventory alert scan");
        inventoryService.scanAndCreateAlerts();
    }
}
