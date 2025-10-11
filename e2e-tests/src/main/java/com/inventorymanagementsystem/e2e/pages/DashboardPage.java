package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class DashboardPage extends BasePage {

    @FindBy(css = ".dashboard-title, .welcome-message, h1")
    private WebElement dashboardTitle;

    @FindBy(css = "nav a[href*='inventory'], nav a:contains('Inventory')")
    private WebElement inventoryLink;

    @FindBy(css = "nav a[href*='products'], nav a:contains('Products')")
    private WebElement productsLink;

    @FindBy(css = "nav a[href*='orders'], nav a:contains('Orders')")
    private WebElement ordersLink;

    @FindBy(css = ".user-profile, .avatar, .user-menu")
    private WebElement userProfileMenu;

    @FindBy(css = ".logout-btn, a[href*='logout']")
    private WebElement logoutButton;

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public boolean isDashboardLoaded() {
        return isElementDisplayed(dashboardTitle);
    }

    public String getDashboardTitle() {
        return getElementText(dashboardTitle);
    }

    public InventoryPage navigateToInventory() {
        clickElement(inventoryLink);
        return new InventoryPage(driver);
    }

    public ProductsPage navigateToProducts() {
        clickElement(productsLink);
        return new ProductsPage(driver);
    }

    public OrdersPage navigateToOrders() {
        clickElement(ordersLink);
        return new OrdersPage(driver);
    }

    public void clickUserProfileMenu() {
        clickElement(userProfileMenu);
    }

    public LoginPage logout() {
        clickUserProfileMenu();
        clickElement(logoutButton);
        return new LoginPage(driver);
    }
}