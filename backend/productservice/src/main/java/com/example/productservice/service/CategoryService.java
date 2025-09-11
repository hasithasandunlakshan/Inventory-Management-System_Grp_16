package com.example.productservice.service;

import com.example.productservice.models.Category;
import com.example.productservice.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<Category> getCategoryByName(String categoryName) {
        return categoryRepository.findByCategoryName(categoryName);
    }
    
    public Category createCategory(String categoryName) {
        if (categoryRepository.existsByCategoryName(categoryName)) {
            throw new RuntimeException("Category with name '" + categoryName + "' already exists");
        }
        
        Category category = Category.builder()
                .categoryName(categoryName)
                .build();
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, String categoryName) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (categoryRepository.existsByCategoryName(categoryName) && 
            !category.getCategoryName().equals(categoryName)) {
            throw new RuntimeException("Category with name '" + categoryName + "' already exists");
        }
        
        category.setCategoryName(categoryName);
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}


