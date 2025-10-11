package com.inventorymanagementsystem.e2e.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.safari.SafariDriver;

import java.time.Duration;

public class DriverManager {
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    public static WebDriver getDriver() {
        if (driver.get() == null) {
            initializeDriver();
        }
        return driver.get();
    }

    public static void initializeDriver() {
        String browser = ConfigReader.getBrowser().toLowerCase();

        switch (browser) {
            case "chrome":
                WebDriverManager.chromedriver().setup();
                ChromeOptions chromeOptions = new ChromeOptions();
                // Uncomment the line below for headless mode
                // chromeOptions.addArguments("--headless");
                driver.set(new ChromeDriver(chromeOptions));
                break;
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                // Uncomment the line below for headless mode
                // firefoxOptions.addArguments("--headless");
                driver.set(new FirefoxDriver(firefoxOptions));
                break;
            case "edge":
                WebDriverManager.edgedriver().setup();
                driver.set(new EdgeDriver());
                break;
            case "safari":
                driver.set(new SafariDriver());
                break;
            default:
                WebDriverManager.chromedriver().setup();
                driver.set(new ChromeDriver());
                break;
        }

        // Set implicit wait time
        driver.get().manage().timeouts().implicitlyWait(Duration.ofSeconds(ConfigReader.getImplicitWaitTime()));
        driver.get().manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        driver.get().manage().window().maximize();
    }

    public static void quitDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }
}