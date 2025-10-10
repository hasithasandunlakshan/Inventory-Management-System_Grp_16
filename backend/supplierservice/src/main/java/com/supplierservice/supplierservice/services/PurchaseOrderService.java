package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.repository.spec.PurchaseOrderSpecs;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;
import static com.supplierservice.supplierservice.repository.spec.PurchaseOrderSpecs.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Service
public class PurchaseOrderService {

        private final PurchaseOrderRepository purchaseOrderRepository;
        private final PurchaseOrderItemRepository itemRepository;
        private final SupplierRepository supplierRepository;

        public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                        PurchaseOrderItemRepository itemRepository,
                        SupplierRepository supplierRepository) {
                this.purchaseOrderRepository = purchaseOrderRepository;
                this.itemRepository = itemRepository;
                this.supplierRepository = supplierRepository;
        }

        private void validateTransition(PurchaseOrderStatus from, PurchaseOrderStatus to) {
                if (from == to)
                        return;

                // Terminal states: cannot leave
                if (from == PurchaseOrderStatus.RECEIVED || from == PurchaseOrderStatus.CANCELLED) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Cannot change status from " + from + " (order is terminal)");
                }

                // Allowed path: DRAFT -> SENT -> PENDING -> RECEIVED
                // Cancel is allowed from any non-terminal state.
                switch (to) {
                        case DRAFT ->
                                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot revert back to DRAFT");
                        case SENT -> {
                                if (from != PurchaseOrderStatus.DRAFT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only DRAFT -> SENT is allowed");
                                }
                        }
                        case PENDING -> {
                                if (from != PurchaseOrderStatus.SENT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only SENT -> PENDING is allowed");
                                }
                        }
                        case RECEIVED -> {
                                if (from != PurchaseOrderStatus.PENDING && from != PurchaseOrderStatus.SENT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only SENT/PENDING -> RECEIVED is allowed");
                                }
                        }
                        case CANCELLED -> {
                                // allowed from DRAFT/SENT/PENDING; already excluded terminal above
                        }
                        default -> throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                        "Unsupported status: " + to);
                }
        }

        @Transactional
        public PurchaseOrderDTO updateStatus(Long id, StatusUpdateDTO body) {
                if (body == null || body.getStatus() == null || body.getStatus().isBlank()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
                }

                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                PurchaseOrderStatus to = PurchaseOrderStatus.valueOf(body.getStatus().toUpperCase());
                PurchaseOrderStatus from = po.getStatus();

                validateTransition(from, to);

                po.setStatus(to);
                // TODO (optional): record reason, timestamps, audit trail
                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
        }

        @Transactional
        public PurchaseOrderDTO markReceived(Long id, ReceiveRequestDTO body) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // Treat as a specific transition to RECEIVED with its own rule:
                PurchaseOrderStatus from = po.getStatus();
                PurchaseOrderStatus to = PurchaseOrderStatus.RECEIVED;
                validateTransition(from, to);

                po.setStatus(PurchaseOrderStatus.RECEIVED);
                // If you later add fields like receivedAt/receivedBy, set them here using
                // 'body'
                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
        }

        @Transactional
        public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO dto) {
                Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

                PurchaseOrder order = PurchaseOrder.builder()
                                .supplier(supplier)
                                .date(dto.getDate())
                                .status(toStatusOrDefault(dto.getStatus()))
                                .build();

                // build items
                if (dto.getItems() != null) {
                        List<PurchaseOrderItem> items = dto.getItems().stream()
                                        .map(itemDTO -> PurchaseOrderItem.builder()
                                                        .purchaseOrder(order)
                                                        .itemId(itemDTO.getItemId())
                                                        .quantity(itemDTO.getQuantity())
                                                        .unitPrice(itemDTO.getUnitPrice())
                                                        .build())
                                        .collect(Collectors.toList());
                        order.getItems().addAll(items);
                }

                PurchaseOrder saved = purchaseOrderRepository.save(order);
                return toDetailDTO(saved); // mapped while still in tx
        }

        @Transactional(readOnly = true)
        public List<PurchaseOrderSummaryDTO> getAllOrders() {
                List<PurchaseOrder> list = purchaseOrderRepository.findAll(); // supplier is fetched via @EntityGraph
                return list.stream().map(this::toSummaryDTO).toList();
        }

        @Transactional(readOnly = true)
        public PurchaseOrderDTO getOrderById(Long id) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));
                return toDetailDTO(po);
        }

        // ===== mapping =====

        private PurchaseOrderSummaryDTO toSummaryDTO(PurchaseOrder po) {
                double total = po.getItems() == null ? 0.0
                                : po.getItems().stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum();

                return PurchaseOrderSummaryDTO.builder()
                                .id(po.getPoId())
                                .poNumber(null) // add when you implement numbering
                                .supplierId(po.getSupplier().getSupplierId())
                                .supplierName(po.getSupplier().getUser().getFullName())
                                .date(po.getDate())
                                .status(po.getStatus().name())
                                .total(total)
                                .build();
        }

        private PurchaseOrderDTO toDetailDTO(PurchaseOrder po) {
                List<PurchaseOrderItemDTO> items = po.getItems() == null ? List.of()
                                : po.getItems().stream().map(i -> PurchaseOrderItemDTO.builder()
                                                .id(i.getId())
                                                .itemId(i.getItemId())
                                                .quantity(i.getQuantity())
                                                .unitPrice(i.getUnitPrice())
                                                .lineTotal(i.getQuantity() * i.getUnitPrice())
                                                .build()).toList();

                double subtotal = items.stream()
                                .mapToDouble(x -> x.getLineTotal() == null ? 0.0 : x.getLineTotal())
                                .sum();

                return PurchaseOrderDTO.builder()
                                .id(po.getPoId())
                                .supplierId(po.getSupplier().getSupplierId())
                                .supplierName(po.getSupplier().getUser().getFullName())
                                .date(po.getDate())
                                .status(po.getStatus().name())
                                .items(items)
                                .subtotal(subtotal)
                                .total(subtotal) // adjust later if you add tax/discount
                                .build();
        }

        private PurchaseOrderStatus toStatusOrDefault(String status) {
                if (status == null || status.isBlank())
                        return PurchaseOrderStatus.DRAFT;
                return PurchaseOrderStatus.valueOf(status.toUpperCase());
        }

        @Transactional
        public PurchaseOrderDTO updatePurchaseOrder(Long id, PurchaseOrderUpdateDTO req) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // unified rule
                ensureEditableStatus(po);

                if (req.getSupplierId() != null && !req.getSupplierId().equals(po.getSupplier().getSupplierId())) {
                        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                                        "Supplier not found"));
                        po.setSupplier(supplier);
                }
                if (req.getDate() != null) {
                        po.setDate(req.getDate());
                }

                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
        }

        @Transactional
        public void deletePurchaseOrder(Long id, boolean hardDelete, String reason) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // Business rules
                if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a RECEIVED order");
                }

                // Hard delete only allowed for DRAFT (policy)
                if (hardDelete && po.getStatus() == PurchaseOrderStatus.DRAFT) {
                        purchaseOrderRepository.delete(po);
                        return;
                }

                // Soft delete = cancel
                po.setStatus(PurchaseOrderStatus.CANCELLED);
                // (Optional) If you later add fields like cancelledAt/cancelReason, set them
                // here
                purchaseOrderRepository.save(po);
        }

        private void ensureEditableStatus(PurchaseOrder po) {
                switch (po.getStatus()) {
                        case DRAFT, SENT, PENDING -> {
                                /* OK */ }
                        case RECEIVED, CANCELLED -> throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Order header cannot be modified when status is " + po.getStatus());
                        default -> throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Order is not editable in current status: " + po.getStatus());
                }
        }

        // ===== SEARCH =====
        @Transactional(readOnly = true)
        public Page<PurchaseOrderSummaryDTO> search(
                        String q, String status, Long supplierId,
                        LocalDate dateFrom, LocalDate dateTo,
                        Double minTotal, Double maxTotal,
                        int page, int size, String sort) {

                // Build spec
                PurchaseOrderStatus st = null;
                if (status != null && !status.isBlank())
                        st = PurchaseOrderStatus.valueOf(status.toUpperCase());

                Specification<com.supplierservice.supplierservice.models.PurchaseOrder> spec = Specification
                                .where(PurchaseOrderSpecs.fullText(q))
                                .and(PurchaseOrderSpecs.hasStatus(st))
                                .and(PurchaseOrderSpecs.hasSupplierId(supplierId))
                                .and(PurchaseOrderSpecs.dateFrom(dateFrom))
                                .and(PurchaseOrderSpecs.dateTo(dateTo));

                Pageable pageable = PageRequest.of(page, size,
                                (sort == null || sort.isBlank())
                                                ? Sort.by(Sort.Direction.DESC, "date", "poId")
                                                : Sort.by(sort.split(",")));

                Page<com.supplierservice.supplierservice.models.PurchaseOrder> result = purchaseOrderRepository
                                .findAll(spec, pageable);

                // Map and apply total filters after mapping (simple approach)
                List<PurchaseOrderSummaryDTO> mapped = result.getContent().stream()
                                .map(this::toSummaryDTO)
                                .filter(dto -> minTotal == null
                                                || (dto.getTotal() != null && dto.getTotal() >= minTotal))
                                .filter(dto -> maxTotal == null
                                                || (dto.getTotal() != null && dto.getTotal() <= maxTotal))
                                .toList();

                return new PageImpl<>(mapped, pageable, result.getTotalElements());
        }

        // ===== STATS =====
        @Transactional(readOnly = true)
        public StatsSummaryDTO kpiSummary(String q, String status, Long supplierId, LocalDate from, LocalDate to) {
                Page<PurchaseOrderSummaryDTO> page = search(q, status, supplierId, from, to,
                                null, null, 0, Integer.MAX_VALUE / 4, null);

                long count = page.getTotalElements();
                double total = page.getContent().stream()
                                .mapToDouble(s -> Optional.ofNullable(s.getTotal()).orElse(0.0)).sum();

                Map<String, Long> byStatusCounts = page.getContent().stream()
                                .collect(Collectors.groupingBy(PurchaseOrderSummaryDTO::getStatus,
                                                Collectors.counting()));

                Map<String, Double> byStatusTotals = page.getContent().stream()
                                .collect(Collectors.groupingBy(PurchaseOrderSummaryDTO::getStatus,
                                                Collectors.summingDouble(
                                                                s -> Optional.ofNullable(s.getTotal()).orElse(0.0))));

                return StatsSummaryDTO.builder()
                                .count(count)
                                .total(total)
                                .byStatusCounts(byStatusCounts)
                                .byStatusTotals(byStatusTotals)
                                .build();
        }

        // ===== TOTALS FOR A PO =====
        @Transactional(readOnly = true)
        public TotalsDTO computeTotals(Long id) {
                var po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));
                double subtotal = po.getItems() == null ? 0.0
                                : po.getItems().stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum();
                return TotalsDTO.builder()
                                .subtotal(subtotal)
                                .tax(0.0)
                                .discount(0.0)
                                .total(subtotal)
                                .build();
        }

        // ===== EXPORT CSV =====
        @Transactional(readOnly = true)
        public byte[] exportCsv(String q, String status, Long supplierId, LocalDate from, LocalDate to) {
                Page<PurchaseOrderSummaryDTO> page = search(q, status, supplierId, from, to,
                                null, null, 0, Integer.MAX_VALUE / 4, null);

                StringBuilder sb = new StringBuilder();
                sb.append("id,poNumber,supplierId,supplierName,date,status,total\n");
                for (var row : page.getContent()) {
                        sb.append(row.getId()).append(',')
                                        .append(Optional.ofNullable(row.getPoNumber()).orElse("")).append(',')
                                        .append(Optional.ofNullable(row.getSupplierId()).orElse(null)).append(',')
                                        .append(escape(row.getSupplierName())).append(',')
                                        .append(row.getDate()).append(',')
                                        .append(row.getStatus()).append(',')
                                        .append(Optional.ofNullable(row.getTotal()).orElse(0.0))
                                        .append('\n');
                }
                return sb.toString().getBytes(StandardCharsets.UTF_8);
        }

        private String escape(String s) {
                if (s == null)
                        return "";
                String v = s.replace("\"", "\"\"");
                if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
                        return "\"" + v + "\"";
                }
                return v;
        }

        // ===== IMPORT CSV =====
        // CSV format (one row per item):
        // tempKey,supplierId,date,status,itemId,quantity,unitPrice
        // Example:
        // A,101,2025-08-18,DRAFT,5001,10,250.00
        // A,101,2025-08-18,DRAFT,5002,5,100.00
        // B,102,2025-08-19,SENT,7001,3,75.00
        @Transactional
        public ImportReportDTO importCsv(org.springframework.web.multipart.MultipartFile file) {
                int created = 0;
                int failed = 0;
                List<String> errors = new ArrayList<>();
                Map<String, List<String[]>> buckets = new LinkedHashMap<>();

                try (BufferedReader br = new BufferedReader(
                                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                        String header = br.readLine();
                        if (header == null || !header.toLowerCase().startsWith("tempkey")) {
                                failed++;
                                errors.add("Invalid header. Expected: tempKey,supplierId,date,status,itemId,quantity,unitPrice");
                                return new ImportReportDTO(created, failed, errors);
                        }
                        String line;
                        while ((line = br.readLine()) != null) {
                                if (line.isBlank())
                                        continue;
                                String[] parts = parseCsvLine(line);
                                if (parts.length < 7) {
                                        failed++;
                                        errors.add("Malformed row: " + line);
                                        continue;
                                }
                                buckets.computeIfAbsent(parts[0], k -> new ArrayList<>()).add(parts);
                        }
                } catch (IOException e) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.BAD_REQUEST,
                                        "Cannot read CSV: " + e.getMessage());
                }

                for (var entry : buckets.entrySet()) {
                        try {
                                String tempKey = entry.getKey();
                                List<String[]> rows = entry.getValue();

                                String[] first = rows.get(0);
                                Long supplierId = Long.valueOf(first[1]);
                                LocalDate date = LocalDate.parse(first[2]);
                                PurchaseOrderStatus status = PurchaseOrderStatus.valueOf(first[3].toUpperCase());

                                var dto = new PurchaseOrderDTO();
                                dto.setSupplierId(supplierId);
                                dto.setDate(date);
                                dto.setStatus(status.name());

                                List<PurchaseOrderItemDTO> items = new ArrayList<>();
                                for (String[] r : rows) {
                                        PurchaseOrderItemDTO item = PurchaseOrderItemDTO.builder()
                                                        .itemId(Long.valueOf(r[4]))
                                                        .quantity(Integer.parseInt(r[5]))
                                                        .unitPrice(Double.parseDouble(r[6]))
                                                        .build();
                                        items.add(item);
                                }
                                dto.setItems(items);

                                createPurchaseOrder(dto);
                                created++;
                        } catch (Exception ex) {
                                failed++;
                                errors.add("Failed group '" + entry.getKey() + "': " + ex.getMessage());
                        }
                }
                return new ImportReportDTO(created, failed, errors);
        }

        private String[] parseCsvLine(String line) {
                // simple split-aware of quotes for our limited columns
                List<String> out = new ArrayList<>();
                StringBuilder cur = new StringBuilder();
                boolean inQuotes = false;
                for (int i = 0; i < line.length(); i++) {
                        char c = line.charAt(i);
                        if (c == '"') {
                                inQuotes = !inQuotes;
                        } else if (c == ',' && !inQuotes) {
                                out.add(cur.toString().trim());
                                cur.setLength(0);
                        } else {
                                cur.append(c);
                        }
                }
                out.add(cur.toString().trim());
                return out.toArray(new String[0]);
        }

        // Paged list of POs for a supplier
        @Transactional(readOnly = true)
        public Page<PurchaseOrderSummaryDTO> listBySupplier(Long supplierId, int page, int size, String sort,
                        java.time.LocalDate from, java.time.LocalDate to,
                        String status /* optional single-status filter */) {
                PurchaseOrderStatus st = (status == null || status.isBlank()) ? null
                                : PurchaseOrderStatus.valueOf(status.toUpperCase());

                Specification<PurchaseOrder> spec = Specification
                                .where(hasSupplierId(supplierId))
                                .and(hasStatus(st))
                                .and(dateFrom(from))
                                .and(dateTo(to));

                Pageable pageable = PageRequest.of(page, size,
                                (sort == null || sort.isBlank()) ? Sort.by(Sort.Direction.DESC, "date", "poId")
                                                : Sort.by(sort.split(",")));

                Page<PurchaseOrder> result = purchaseOrderRepository.findAll(spec, pageable);

                java.util.List<PurchaseOrderSummaryDTO> mapped = result.getContent().stream()
                                .map(this::toSummaryDTO)
                                .toList();

                return new PageImpl<>(mapped, pageable, result.getTotalElements());
        }

        // Open POs (DRAFT,SENT,PENDING) for a supplier (unpaged list or you can page if
        // you wish)
        @Transactional(readOnly = true)
        public java.util.List<PurchaseOrderSummaryDTO> listOpenBySupplier(Long supplierId) {
                java.util.Set<PurchaseOrderStatus> open = java.util.EnumSet.of(
                                PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SENT, PurchaseOrderStatus.PENDING);

                Specification<PurchaseOrder> spec = Specification
                                .where(hasSupplierId(supplierId))
                                .and(statusIn(open));

                return purchaseOrderRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "date", "poId"))
                                .stream().map(this::toSummaryDTO).toList();
        }

        // Spend summary for a supplier in a date range
        @Transactional(readOnly = true)
        public SupplierSpendDTO supplierSpend(Long supplierId, java.time.LocalDate from, java.time.LocalDate to) {
                Specification<PurchaseOrder> spec = Specification
                                .where(hasSupplierId(supplierId))
                                .and(dateFrom(from))
                                .and(dateTo(to));

                java.util.List<PurchaseOrderSummaryDTO> rows = purchaseOrderRepository.findAll(spec, Sort.by("date"))
                                .stream().map(this::toSummaryDTO).toList();

                long count = rows.size();
                double total = rows.stream()
                                .mapToDouble(r -> java.util.Optional.ofNullable(r.getTotal()).orElse(0.0))
                                .sum();

                return SupplierSpendDTO.builder()
                                .supplierId(supplierId)
                                .from(from)
                                .to(to)
                                .orders(count)
                                .total(total)
                                .build();
        }

}
