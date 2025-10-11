package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LoginPage extends BasePage {

    @FindBy(id = "username")
    private WebElement emailInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit'], .login-button")
    private WebElement loginButton;
    @FindBy(css = ".error-message")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void navigateToLoginPage() {
        driver.get("http://localhost:3000/login");
    }

    public void enterUsername(String username) {
        typeText(emailInput, username);
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

    public DashboardPage loginSuccessfully(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
        return new DashboardPage(driver);
    }
}