package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.pages.DashboardPage;
import com.inventorymanagementsystem.e2e.pages.InventoryPage;
import com.inventorymanagementsystem.e2e.pages.LoginPage;
import com.inventorymanagementsystem.e2e.utils.ConfigReader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class InventoryTest extends BaseTest {
    private LoginPage loginPage;
    private DashboardPage dashboardPage;
    private InventoryPage inventoryPage;

    @BeforeEach
    public void setupTest() {
        loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();

        // Login before each test
        dashboardPage = loginPage.loginSuccessfully(
                ConfigReader.getUsername(),
                ConfigReader.getPassword());

        // Navigate to Inventory page
        inventoryPage = dashboardPage.navigateToInventory();
    }

    @Test
    @DisplayName("Inventory page loads successfully")
    public void testInventoryPageLoads() {
        assertTrue(inventoryPage.isInventoryPageLoaded(), "Inventory page should be loaded");
        assertTrue(inventoryPage.isInventoryTableDisplayed(), "Inventory table should be displayed");
    }

    @Test
    @DisplayName("Search inventory functionality")
    public void testSearchInventory() {
        String searchTerm = "Test Product";
        inventoryPage.searchInventory(searchTerm);

        // Note: This is a placeholder assertion - you'll need to implement actual
        // verification
        // based on your application's behavior when searching
        assertTrue(inventoryPage.isInventoryTableDisplayed(),
                "Inventory table should still be displayed after search");
    }

    @Test
    @DisplayName("Add new inventory item button click")
    public void testAddInventoryButtonClick() {
        inventoryPage.clickAddInventoryButton();

        // Note: This is a placeholder assertion - you'll need to implement actual
        // verification
        // based on your application's behavior when clicking add button
        // For example, checking if a modal appears or if redirected to an add inventory
        // form
    }
}