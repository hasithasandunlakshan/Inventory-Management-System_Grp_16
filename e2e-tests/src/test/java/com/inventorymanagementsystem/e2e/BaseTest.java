package com.inventorymanagementsystem.e2e;

import com.inventorymanagementsystem.e2e.utils.DriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;

public class BaseTest {
    protected WebDriver driver;

    @BeforeEach
    public void setUp() {
        DriverManager.initializeDriver();
        driver = DriverManager.getDriver();
    }

    @AfterEach
    public void tearDown() {
        DriverManager.quitDriver();
    }
}