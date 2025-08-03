package com.Orderservice.Orderservice.repository;

import com.Orderservice.Orderservice.entity.Invoice;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByOrder(Order order);
    List<Invoice> findByPaymentStatus(PaymentStatus status);
}