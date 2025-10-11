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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestConfig.class)
public class SupplierControllerRestAssuredTest {

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
                .statusCode(HttpStatus.OK.value())
                .body("$", not(emptyArray()));
    }

    @Test
    void createSupplier_WithValidData_ReturnsCreatedStatus() {
        String supplierJson = """
                {
                    "name": "Test Supplier",
                    "email": "test@supplier.com",
                    "phone": "1234567890",
                    "address": "123 Test St",
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
                .body("name", equalTo("Test Supplier"))
                .body("email", equalTo("test@supplier.com"))
                .body("phone", equalTo("1234567890"))
                .body("address", equalTo("123 Test St"));
    }

    @Test
    void getSupplierById_WithValidId_ReturnsSupplier() {
        // First create a supplier
        String supplierJson = """
                {
                    "name": "Get Test Supplier",
                    "email": "get@supplier.com",
                    "phone": "1234567890",
                    "address": "123 Get St",
                    "categoryId": 1
                }
                """;

        Integer supplierId = given()
                .contentType(ContentType.JSON)
                .body(supplierJson)
                .when()
                .post("/suppliers")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract()
                .path("supplierId");

        // Then get the supplier by ID
        given()
                .contentType(ContentType.JSON)
                .pathParam("id", supplierId)
                .when()
                .get("/suppliers/{id}")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("supplierId", equalTo(supplierId))
                .body("name", equalTo("Get Test Supplier"))
                .body("email", equalTo("get@supplier.com"));
    }

    @Test
    void updateSupplier_WithValidData_ReturnsOkStatus() {
        // First create a supplier
        String createJson = """
                {
                    "name": "Update Test Supplier",
                    "email": "update@supplier.com",
                    "phone": "1234567890",
                    "address": "123 Update St",
                    "categoryId": 1
                }
                """;

        Integer supplierId = given()
                .contentType(ContentType.JSON)
                .body(createJson)
                .when()
                .post("/suppliers")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract()
                .path("supplierId");

        // Then update the supplier
        String updateJson = """
                {
                    "name": "Updated Supplier",
                    "email": "updated@supplier.com",
                    "phone": "0987654321",
                    "address": "321 Update St",
                    "categoryId": 1
                }
                """;

        given()
                .contentType(ContentType.JSON)
                .pathParam("id", supplierId)
                .body(updateJson)
                .when()
                .put("/suppliers/{id}")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("name", equalTo("Updated Supplier"))
                .body("email", equalTo("updated@supplier.com"))
                .body("phone", equalTo("0987654321"))
                .body("address", equalTo("321 Update St"));
    }

    @Test
    void deleteSupplier_WithValidId_ReturnsNoContent() {
        // First create a supplier
        String supplierJson = """
                {
                    "name": "Delete Test Supplier",
                    "email": "delete@supplier.com",
                    "phone": "1234567890",
                    "address": "123 Delete St",
                    "categoryId": 1
                }
                """;

        Integer supplierId = given()
                .contentType(ContentType.JSON)
                .body(supplierJson)
                .when()
                .post("/suppliers")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract()
                .path("supplierId");

        // Then delete the supplier
        given()
                .contentType(ContentType.JSON)
                .pathParam("id", supplierId)
                .when()
                .delete("/suppliers/{id}")
                .then()
                .statusCode(HttpStatus.NO_CONTENT.value());

        // Verify the supplier is deleted
        given()
                .contentType(ContentType.JSON)
                .pathParam("id", supplierId)
                .when()
                .get("/suppliers/{id}")
                .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
    }
}
