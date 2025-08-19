package com.supplierservice.supplierservice.repository.spec;

import com.supplierservice.supplierservice.models.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class PurchaseOrderSpecs {

    public static Specification<PurchaseOrder> hasStatus(PurchaseOrderStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    public static Specification<PurchaseOrder> hasSupplierId(Long supplierId) {
        return (root, q, cb) -> supplierId == null ? cb.conjunction()
                : cb.equal(root.get("supplier").get("supplierId"), supplierId);
    }

    public static Specification<PurchaseOrder> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("date"), from);
    }

    public static Specification<PurchaseOrder> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("date"), to);
    }

    public static Specification<PurchaseOrder> fullText(String qstr) {
        return (root, q, cb) -> {
            if (qstr == null || qstr.isBlank())
                return cb.conjunction();
            String like = "%" + qstr.trim().toLowerCase() + "%";
            // join supplier for name search
            var supplier = root.join("supplier");
            return cb.or(
                    cb.like(cb.lower(supplier.get("name")), like)
            // add more fields when you have (poNumber, notes, etc.)
            );
        };
    }
}
