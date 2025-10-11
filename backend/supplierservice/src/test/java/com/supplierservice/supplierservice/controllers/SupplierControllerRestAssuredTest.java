package com.supplierservice.supplierservice.controllers;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.supplierservice.supplierservice.config.TestConfig;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
                "spring.jpa.hibernate.ddl-auto=none",
                "spring.cloud.discovery.enabled=false",
                "eureka.client.enabled=false"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
public class SupplierControllerRestAssuredTest {

        @LocalServerPort
        private int port;

        @BeforeEach
        void setUp() {
                RestAssured.port = port;
                RestAssured.basePath = "/api";
                RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
        }

        @Test
        void getAllSuppliers_ReturnsOkStatus() {
                given()
                                .contentType(ContentType.JSON)
                                .when()
                                .get("/suppliers")
                                .then()
                                .statusCode(HttpStatus.OK.value())
                                .body("$", not(emptyArray()));
        }

        @Test
        void createSupplier_WithValidData_ReturnsCreatedStatus() {
                String supplierJson = """
                                {
                                    "userId": 1,
                                    "categoryId": 1
                                }
                                """;

                given()
                                .contentType(ContentType.JSON)
                                .body(supplierJson)
                                .when()
                                .post("/suppliers")
                                .then()
                                .statusCode(HttpStatus.CREATED.value())
                                .body("supplierId", notNullValue())
                                .body("userId", equalTo(1))
                                .body("userName", equalTo("Test User 1"))
                                .body("categoryId", equalTo(1))
                                .body("categoryName", equalTo("Electronics"));
        }

        @Test
        void getSupplierById_WithValidId_ReturnsSupplier() {
                given()
                                .contentType(ContentType.JSON)
                                .pathParam("id", 1)
                                .when()
                                .get("/suppliers/{id}")
                                .then()
                                .statusCode(HttpStatus.OK.value())
                                .body("supplierId", equalTo(1))
                                .body("userId", equalTo(1))
                                .body("userName", equalTo("Test User 1"))
                                .body("categoryId", equalTo(1))
                                .body("categoryName", equalTo("Electronics"));
        }

        @Test
        void updateSupplier_WithValidData_ReturnsOkStatus() {
                String updateJson = """
                                {
                                    "supplierId": 1,
                                    "userId": 2,
                                    "categoryId": 2
                                }
                                """;

                given()
                                .contentType(ContentType.JSON)
                                .pathParam("id", 1)
                                .body(updateJson)
                                .when()
                                .put("/suppliers/{id}")
                                .then()
                                .statusCode(HttpStatus.OK.value())
                                .body("supplierId", equalTo(1))
                                .body("userId", equalTo(2))
                                .body("userName", equalTo("Test User 2"))
                                .body("categoryId", equalTo(2))
                                .body("categoryName", equalTo("Office Supplies"));
        }

        @Test
        void deleteSupplier_WithValidId_ReturnsNoContent() {
                given()
                                .contentType(ContentType.JSON)
                                .pathParam("id", 1)
                                .when()
                                .delete("/suppliers/{id}")
                                .then()
                                .statusCode(HttpStatus.NO_CONTENT.value());
        }
}
