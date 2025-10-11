package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LoginPage extends BasePage {

    @FindBy(id = "email")
    private WebElement emailInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(xpath = "//button[contains(text(), 'Login') or contains(text(), 'Sign In')]")
    private WebElement loginButton;

    @FindBy(css = ".error-message")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void navigateToLoginPage() {
        driver.get(super.driver.getCurrentUrl() + "/login");
    }

    public void enterEmail(String email) {
        typeText(emailInput, email);
    }

    public void enterPassword(String password) {
        typeText(passwordInput, password);
    }

    public void clickLoginButton() {
        clickElement(loginButton);
    }

    public boolean isErrorMessageDisplayed() {
        return isElementDisplayed(errorMessage);
    }

    public String getErrorMessage() {
        return getElementText(errorMessage);
    }

    public DashboardPage loginSuccessfully(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLoginButton();
        return new DashboardPage(driver);
    }
}