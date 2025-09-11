package com.Orderservice.Orderservice;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;

import com.Orderservice.Orderservice.controller.OrderControllerTest;
import com.Orderservice.Orderservice.integration.OrderControllerIntegrationTest;
import com.Orderservice.Orderservice.integration.PaymentServiceIntegrationTest;
import com.Orderservice.Orderservice.repository.OrderRepositoryTest;
import com.Orderservice.Orderservice.service.OrderServiceTest;
import com.Orderservice.Orderservice.service.PaymentServiceTest;

/**
 * Test Suite for running all Orderservice tests
 * 
 * Usage:
 * - Run this class to execute all tests
 * - Use @SelectPackages to run tests by package
 * - Use @SelectClasses to run specific test classes
 */
@Suite
@SelectClasses({
    // Unit Tests
    OrderServiceTest.class,
    PaymentServiceTest.class,
    OrderControllerTest.class,
    
    // Repository Tests
    OrderRepositoryTest.class,
    
    // Integration Tests
    OrderControllerIntegrationTest.class,
    PaymentServiceIntegrationTest.class
})
public class OrderserviceTestSuite {
    // This class remains empty, used only as a holder for the above annotations
}
