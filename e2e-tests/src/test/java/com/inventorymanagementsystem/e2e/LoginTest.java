package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.pages.DashboardPage;
import com.inventorymanagementsystem.e2e.pages.LoginPage;
import com.inventorymanagementsystem.e2e.utils.ConfigReader;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class LoginTest extends BaseTest {

    @Test
    @DisplayName("Successful login with valid credentials")
    public void testSuccessfulLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();

        DashboardPage dashboardPage = loginPage.loginSuccessfully(
                ConfigReader.getUsername(),
                ConfigReader.getPassword());

        assertTrue(dashboardPage.isDashboardLoaded(), "Dashboard page should be loaded after successful login");
    }

    @Test
    @DisplayName("Failed login with invalid credentials")
    public void testFailedLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();

        loginPage.enterUsername("invalid");
        loginPage.enterPassword("wrongpassword");
        loginPage.clickLoginButton();

        assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed after failed login");
    }

    @Test
    @DisplayName("Empty fields validation")
    public void testEmptyFieldsValidation() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();

        // Try to login without entering credentials
        loginPage.clickLoginButton();

        assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed when fields are empty");
    }
}