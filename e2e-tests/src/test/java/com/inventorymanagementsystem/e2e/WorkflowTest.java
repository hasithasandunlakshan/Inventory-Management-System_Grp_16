package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.pages.DashboardPage;
import com.inventorymanagementsystem.e2e.pages.InventoryPage;
import com.inventorymanagementsystem.e2e.pages.LoginPage;
import com.inventorymanagementsystem.e2e.pages.OrdersPage;
import com.inventorymanagementsystem.e2e.pages.ProductsPage;
import com.inventorymanagementsystem.e2e.utils.ConfigReader;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class WorkflowTest extends BaseTest {

    @Test
    @DisplayName("Complete user workflow")
    public void testCompleteUserWorkflow() {
        // 1. Login
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();

        DashboardPage dashboardPage = loginPage.loginSuccessfully(
                ConfigReader.getUsername(),
                ConfigReader.getPassword());
        assertTrue(dashboardPage.isDashboardLoaded(), "Dashboard should be loaded after login");

        // 2. Navigate to Products
        ProductsPage productsPage = dashboardPage.navigateToProducts();
        assertTrue(productsPage.isProductsPageLoaded(), "Products page should be loaded");

        // 3. Search for a product
        productsPage.searchProduct("Test Product");
        assertTrue(productsPage.isProductTableDisplayed(), "Product table should be displayed after search");

        // 4. Navigate to Inventory
        InventoryPage inventoryPage = dashboardPage.navigateToInventory();
        assertTrue(inventoryPage.isInventoryPageLoaded(), "Inventory page should be loaded");

        // 5. Search inventory
        inventoryPage.searchInventory("Test Product");
        assertTrue(inventoryPage.isInventoryTableDisplayed(), "Inventory table should be displayed after search");

        // 6. Navigate to Orders
        OrdersPage ordersPage = dashboardPage.navigateToOrders();
        assertTrue(ordersPage.isOrdersPageLoaded(), "Orders page should be loaded");

        // 7. Logout
        loginPage = dashboardPage.logout();

        // Add verification for successful logout if applicable
    }
}