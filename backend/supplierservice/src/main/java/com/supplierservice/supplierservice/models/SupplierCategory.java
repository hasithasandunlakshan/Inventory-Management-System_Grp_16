package com.supplierservice.supplierservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "supplier_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id") // Match your database column name
    private Long categoryId;

    @Column(name = "name", nullable = false, unique = true, length = 100) // Match your database varchar(100)
    private String name;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @JsonIgnore // <-- Prevent Jackson from triggering lazy load
    @ToString.Exclude // <-- Avoid toString() causing lazy init
    @EqualsAndHashCode.Exclude // <-- Avoid equals/hashCode traversing the collection
    private List<Supplier> suppliers;
}
