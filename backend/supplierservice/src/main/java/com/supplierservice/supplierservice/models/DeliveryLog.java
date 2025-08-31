package com.supplierservice.supplierservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "delivery_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLog {

    @Id
    private Long poId;

    @OneToOne(fetch = FetchType.LAZY) // make it lazy to avoid eager graph pulls
    @MapsId
    @JoinColumn(name = "po_id")
    @JsonIgnore // <-- prevent Jackson from triggering lazy init
    @ToString.Exclude // <-- avoid toString() walking into proxies
    @EqualsAndHashCode.Exclude
    private PurchaseOrder purchaseOrder;

    private int receivedQuantity;

    private LocalDate receivedDate;
    private Long item_id;
}
