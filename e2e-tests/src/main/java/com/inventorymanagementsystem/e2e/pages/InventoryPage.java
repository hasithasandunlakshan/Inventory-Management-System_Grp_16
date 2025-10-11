package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class InventoryPage extends BasePage {

    @FindBy(css = ".inventory-title, h1")
    private WebElement pageTitle;

    @FindBy(css = ".add-inventory-btn, button:contains('Add')")
    private WebElement addInventoryButton;

    @FindBy(css = ".search-inventory")
    private WebElement searchInventoryInput;

    @FindBy(css = ".inventory-table, table")
    private WebElement inventoryTable;

    public InventoryPage(WebDriver driver) {
        super(driver);
    }

    public boolean isInventoryPageLoaded() {
        return isElementDisplayed(pageTitle);
    }

    public void clickAddInventoryButton() {
        clickElement(addInventoryButton);
    }

    public void searchInventory(String searchTerm) {
        typeText(searchInventoryInput, searchTerm);
    }

    public boolean isInventoryTableDisplayed() {
        return isElementDisplayed(inventoryTable);
    }
}