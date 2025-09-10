package com.Orderservice.Orderservice.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.Stripe;
import com.stripe.model.Charge;
import com.stripe.model.ChargeCollection;
import com.stripe.param.ChargeListParams;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    public RevenueController(@Value("${stripe.api.key}") String stripeApiKey) {
        Stripe.apiKey = stripeApiKey;
    }

    @GetMapping("/today")
    public Map<String, Object> getTodaysRevenue() throws Exception {
        LocalDate today = LocalDate.now();
        long start = today.atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
        long end = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
        
        ChargeListParams params = ChargeListParams.builder()
                .setCreated(ChargeListParams.Created.builder().setGte(start).setLt(end).build())
                .setLimit(100L)
                .build();
        ChargeCollection charges = Charge.list(params);
        double total = charges.getData().stream().filter(c -> "succeeded".equals(c.getStatus())).mapToDouble(c -> c.getAmount() / 100.0).sum();
        Map<String, Object> result = new HashMap<>();
        result.put("date", today);
        result.put("revenue", total);
        result.put("currency", charges.getData().isEmpty() ? "usd" : charges.getData().get(0).getCurrency());
        result.put("count", charges.getData().size());
        return result;
    }

    @GetMapping("/monthly")
    public List<Map<String, Object>> getMonthlyRevenue(@RequestParam(defaultValue = "2025") int year) throws Exception {
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = (month == 12) ? LocalDate.of(year + 1, 1, 1) : LocalDate.of(year, month + 1, 1);
            long start = startDate.atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
            long end = endDate.atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
            ChargeListParams params = ChargeListParams.builder()
                    .setCreated(ChargeListParams.Created.builder().setGte(start).setLt(end).build())
                    .setLimit(100L)
                    .build();
            ChargeCollection charges = Charge.list(params);
            double total = charges.getData().stream().filter(c -> "succeeded".equals(c.getStatus())).mapToDouble(c -> c.getAmount() / 100.0).sum();
            Map<String, Object> result = new HashMap<>();
            result.put("month", startDate.getMonth().toString());
            result.put("revenue", total);
            result.put("currency", charges.getData().isEmpty() ? "usd" : charges.getData().get(0).getCurrency());
            result.put("count", charges.getData().size());
            monthly.add(result);
        }
        return monthly;
    }

    @GetMapping("/stripe-stats")
    public Map<String, Object> getStripeStats() throws Exception {
        ChargeListParams params = ChargeListParams.builder().setLimit(100L).build();
        ChargeCollection charges = Charge.list(params);
        double total = charges.getData().stream().filter(c -> "succeeded".equals(c.getStatus())).mapToDouble(c -> c.getAmount() / 100.0).sum();
        long refunds = charges.getData().stream().filter(c -> c.getRefunded()).count();
        Map<String, Object> result = new HashMap<>();
        result.put("total_revenue", total);
        result.put("total_payments", charges.getData().size());
        result.put("total_refunds", refunds);
        return result;
    }
}
