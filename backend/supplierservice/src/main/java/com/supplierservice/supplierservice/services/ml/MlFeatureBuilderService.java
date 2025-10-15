package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.dto.MlPoFeaturesDTO;
import com.supplierservice.supplierservice.models.PurchaseOrderStatus;
import com.supplierservice.supplierservice.models.Supplier;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MlFeatureBuilderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public MlPoFeaturesDTO buildSupplierFeatures(Long supplierId, LocalDate orderDateOpt) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + supplierId));

        LocalDate today = Optional.ofNullable(orderDateOpt).orElse(LocalDate.now());
        LocalDate start30 = today.minusDays(30);
        LocalDate start90 = today.minusDays(90);

        long orders30 = purchaseOrderRepository
                .countBySupplier_SupplierIdAndDateBetween(supplierId, start30, today);
        long orders90 = purchaseOrderRepository
                .countBySupplier_SupplierIdAndDateBetween(supplierId, start90, today);

        long received90 = purchaseOrderRepository
                .countBySupplierAndStatusInRange(supplierId, start90, today, PurchaseOrderStatus.RECEIVED);
        long cancelled90 = purchaseOrderRepository
                .countBySupplierAndStatusInRange(supplierId, start90, today, PurchaseOrderStatus.CANCELLED);

        double receivedRate90 = orders90 == 0 ? 0.0 : (double) received90 / (double) orders90;
        double cancelRate90 = orders90 == 0 ? 0.0 : (double) cancelled90 / (double) orders90;

        LocalDate lastOrderDate = purchaseOrderRepository.findLastOrderDate(supplierId);
        Long daysSinceLastPo = lastOrderDate == null ? null : ChronoUnit.DAYS.between(lastOrderDate, today);

        Integer monthNum = null;
        Integer weekdayNum = null;
        String orderDateStr = null;
        if (orderDateOpt != null) {
            monthNum = orderDateOpt.getMonthValue();
            DayOfWeek dow = orderDateOpt.getDayOfWeek();
            // Map to 1..7, Mon=1
            weekdayNum = dow.getValue();
            orderDateStr = orderDateOpt.toString();
        }

        Long categoryId = supplier.getCategory() != null ? supplier.getCategory().getCategoryId() : null;

        return MlPoFeaturesDTO.builder()
                .supplier_id(supplier.getSupplierId())
                .category_id(categoryId)
                .orders_30d((int) orders30)
                .orders_90d((int) orders90)
                .received_rate_90d(receivedRate90)
                .cancel_rate_90d(cancelRate90)
                .days_since_last_po(daysSinceLastPo)
                .month_num(monthNum)
                .weekday_num(weekdayNum)
                .order_date(orderDateStr)
                .build();
    }
}
