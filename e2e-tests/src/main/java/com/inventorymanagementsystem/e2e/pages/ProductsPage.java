package com.inventorymanagementsystem.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class ProductsPage extends BasePage {

    @FindBy(css = ".products-title, h1")
    private WebElement pageTitle;

    @FindBy(css = ".add-product-btn, button:contains('Add')")
    private WebElement addProductButton;

    @FindBy(css = ".search-product")
    private WebElement searchProductInput;

    @FindBy(css = ".product-table, table")
    private WebElement productTable;

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    public boolean isProductsPageLoaded() {
        return isElementDisplayed(pageTitle);
    }

    public void clickAddProductButton() {
        clickElement(addProductButton);
    }

    public void searchProduct(String searchTerm) {
        typeText(searchProductInput, searchTerm);
    }

    public boolean isProductTableDisplayed() {
        return isElementDisplayed(productTable);
    }
}