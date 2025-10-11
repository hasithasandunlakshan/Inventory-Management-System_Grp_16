package com.supplierservice.supplierservice.controllers;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SupplierRestAssuredIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    void getAllSuppliers_ReturnsOkStatus() {
        given()
                .contentType(ContentType.JSON)
                .when()
                .get("/suppliers")
                .then()
                .statusCode(200)
                .body("$", not(empty()));
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
                .statusCode(201)
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
                .statusCode(200)
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
                .statusCode(200)
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
                .pathParam("id", 2)
                .when()
                .delete("/suppliers/{id}")
                .then()
                .statusCode(204);

        // Verify the supplier is deleted
        given()
                .contentType(ContentType.JSON)
                .pathParam("id", 2)
                .when()
                .get("/suppliers/{id}")
                .then()
                .statusCode(404);
    }
}
