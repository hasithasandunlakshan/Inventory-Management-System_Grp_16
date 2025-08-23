package com.supplierservice.supplierservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Supplier Service API", version = "v1", description = "Endpoints for suppliers, purchase orders, delivery logs, and categories"))
public class OpenApiConfig {
}
