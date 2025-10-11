package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.utils.ConfigReader;
import com.inventorymanagementsystem.e2e.utils.DriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.*;

public class BasicSeleniumTest {

    private WebDriver driver;

    @BeforeEach
    public void setUp() {
        DriverManager.initializeDriver();
        driver = DriverManager.getDriver();
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
        DriverManager.quitDriver();
    }

    @Test
    @DisplayName("Basic test to verify Selenium is working")
    public void testSeleniumWorking() {
        // Simply navigate to the frontend URL
        driver.get(ConfigReader.getBaseUrl());

        // Take a screenshot for proof
        // If you were using a reporting framework like Allure, you'd save screenshots
        // here

        // Simple assertion that we loaded a page
        assertTrue(driver.getTitle() != null, "Page title should not be null");

        System.out.println("Page title: " + driver.getTitle());
        System.out.println("Current URL: " + driver.getCurrentUrl());

        // Check if we can find basic HTML elements
        WebElement body = driver.findElement(By.tagName("body"));
        assertNotNull(body, "Body element should be present on page");

        // Success!
        System.out.println("Selenium test ran successfully!");
    }
}