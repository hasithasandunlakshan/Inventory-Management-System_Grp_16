package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.utils.ConfigReader;
import com.inventorymanagementsystem.e2e.utils.DriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

public class ScreenshotTest {

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
    @DisplayName("Take screenshot of login page")
    public void takeLoginPageScreenshot() throws IOException {
        // Navigate to the login page
        driver.get(ConfigReader.getBaseUrl() + "/login");

        // Verify page loaded
        assertTrue(driver.getCurrentUrl().contains("login"), "URL should contain 'login'");

        // Take a screenshot
        File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);

        // Create screenshots directory if it doesn't exist
        Path screenshotDir = Paths.get("target/screenshots");
        Files.createDirectories(screenshotDir);

        // Generate a unique filename with timestamp
        String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
        Path destinationPath = screenshotDir.resolve("login-page-" + timestamp + ".png");

        // Save the screenshot
        Files.copy(screenshotFile.toPath(), destinationPath);

        System.out.println("Screenshot saved to: " + destinationPath.toAbsolutePath());

        // Check if fields are present (additional verification)
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.cssSelector("button[type='submit'], .login-button"));

        assertTrue(usernameField.isDisplayed(), "Username field should be visible");
        assertTrue(passwordField.isDisplayed(), "Password field should be visible");
        assertTrue(loginButton.isDisplayed(), "Login button should be visible");
    }
}