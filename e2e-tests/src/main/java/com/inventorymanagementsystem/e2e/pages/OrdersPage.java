package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class OrdersPage extends BasePage {

    @FindBy(css = ".orders-title, h1")
    private WebElement pageTitle;

    @FindBy(css = ".create-order-btn, button:contains('Create')")
    private WebElement createOrderButton;

    @FindBy(css = ".search-order")
    private WebElement searchOrderInput;

    @FindBy(css = ".orders-table, table")
    private WebElement ordersTable;

    public OrdersPage(WebDriver driver) {
        super(driver);
    }

    public boolean isOrdersPageLoaded() {
        return isElementDisplayed(pageTitle);
    }

    public void clickCreateOrderButton() {
        clickElement(createOrderButton);
    }

    public void searchOrder(String searchTerm) {
        typeText(searchOrderInput, searchTerm);
    }

    public boolean isOrdersTableDisplayed() {
        return isElementDisplayed(ordersTable);
    }
}