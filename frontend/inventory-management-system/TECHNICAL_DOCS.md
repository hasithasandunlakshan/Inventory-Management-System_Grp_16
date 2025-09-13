# Technical Documentation - Inventory Management System

## 🏗️ System Architecture

### Microservices Design Pattern

Our system follows the microservices architecture pattern with the following principles:

- **Single Responsibility**: Each service handles one business domain
- **Database per Service**: Shared database for simplicity (can be split later)
- **API Gateway**: Centralized entry point for all client requests
- **Service Discovery**: Services register with Eureka (planned)
- **Circuit Breaker**: Fault tolerance for service calls (planned)

### Service Communication

```
Client → API Gateway → Microservice → Database
```

**Communication Patterns:**
- **Synchronous**: REST API calls between services
- **Asynchronous**: Event-driven communication (planned)
- **Service Mesh**: Istio for service-to-service communication (planned)

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "userId": 123,
    "email": "user@example.com",
    "role": "MANAGER",
    "iat": 1234567890,
    "exp": 1234567890
  },
  "signature": "HMACSHA512(...)"
}
```

### Token Lifecycle

1. **Generation**: User logs in → Backend generates JWT
2. **Storage**: Token stored in HTTP-only cookie
3. **Validation**: API Gateway validates on each request
4. **Refresh**: Token refreshed on valid usage
5. **Expiration**: User redirected to login on expiration

### Role-Based Access Control (RBAC)

```typescript
// Frontend middleware
export function middleware(request: NextRequest) {
  const token = request.cookies.get('inventory_auth_token')?.value;
  const userRole = validateToken(token)?.role;
  
  if (!hasRequiredRole(userRole, requiredRoles)) {
    return NextResponse.redirect('/unauthorized');
  }
}
```

```java
// Backend API Gateway
private boolean hasAccess(String path, String role) {
    if (path.startsWith("/api/products")) {
        return role.equals("MANAGER");
    }
    if (path.startsWith("/api/orders")) {
        return role.equals("STORE_KEEPER") || role.equals("MANAGER");
    }
    // ... more rules
}
```

## 🗄️ Database Design

### Entity Relationship Diagram

```
Users (1) ←→ (M) UserRoles (M) ←→ (1) Roles
Users (1) ←→ (M) Orders
Products (1) ←→ (M) OrderItems (M) ←→ (1) Orders
Categories (1) ←→ (M) Products
Suppliers (1) ←→ (M) PurchaseOrders
Inventory (1) ←→ (M) StockMovements
```

### Key Tables

```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id BIGINT,
    image_url VARCHAR(500),
    barcode VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔄 API Design

### RESTful API Principles

- **Resource-based URLs**: `/api/products`, `/api/orders`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **JSON Format**: Consistent request/response format

### API Gateway Configuration

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8081
          predicates:
            - Path=/api/auth/**
        - id: product-service
          uri: http://localhost:8083
          predicates:
            - Path=/api/products/**
          filters:
            - name: JwtAuthenticationFilter
```

### Service Endpoints

#### User Service (Port 8081)
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request);
    
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request);
    
    @GetMapping("/users")
    public ResponseEntity<List<UserInfo>> getAllUsers();
}
```

#### Product Service (Port 8083)
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts();
    
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest request);
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest request);
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id);
}
```

## 🎨 Frontend Architecture

### Next.js App Router Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── manager/
│   │   │   └── page.tsx
│   │   └── storekeeper/
│   │       └── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx
│   └── login/
│       └── page.tsx
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── charts/             # Chart components
│   ├── dashboard/          # Dashboard components
│   └── product/            # Product-related components
├── lib/
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
└── hooks/                  # Custom React hooks
```

### Component Architecture

```typescript
// Example component structure
interface ProductCardProps {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly imageUrl?: string;
  readonly categoryName?: string;
  readonly showActions?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  stock,
  imageUrl,
  categoryName,
  showActions = true
}: ProductCardProps) {
  // Component logic
}
```

### State Management

```typescript
// Context for global state
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Custom hooks for state management
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## 📱 Mobile Application

### React Native Architecture

```
src/
├── components/             # Reusable components
├── screens/               # Screen components
├── navigation/            # Navigation configuration
├── services/              # API services
├── hooks/                 # Custom hooks
└── utils/                 # Utility functions
```

### Cross-Platform Features

- **Shared Business Logic**: Same API services as web app
- **Platform-Specific UI**: Native components for iOS/Android
- **Offline Support**: Local storage for offline functionality
- **Push Notifications**: Real-time notifications for stock alerts

## 🔧 Development Tools

### Frontend Development

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Backend Development

```xml
<!-- Maven configuration -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

### Code Quality Tools

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit testing framework
- **Cypress**: End-to-end testing (planned)

## 🚀 Deployment

### Docker Configuration

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim
VOLUME /tmp
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend/inventory-management-system
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
  
  api-gateway:
    build: ./backend/ApiGateway
    ports:
      - "8090:8090"
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: inventory_db
    ports:
      - "3306:3306"
```

## 📊 Monitoring & Logging

### Application Logging

```java
// Backend logging
@Slf4j
@RestController
public class ProductController {
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        log.info("Fetching all products");
        // Implementation
    }
}
```

```typescript
// Frontend logging
console.log('🔐 Middleware: Processing request for', pathname);
console.log('🔍 JWT Filter - Token valid, userId:', userId);
```

### Performance Monitoring

- **Frontend**: Next.js built-in analytics
- **Backend**: Spring Boot Actuator endpoints
- **Database**: MySQL performance schema
- **APM**: Application Performance Monitoring (planned)

## 🔒 Security Best Practices

### Input Validation

```java
// Backend validation
@Valid
@RequestBody CreateProductRequest request

public class CreateProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must be less than 100 characters")
    private String name;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    private BigDecimal price;
}
```

```typescript
// Frontend validation
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative')
});
```

### SQL Injection Prevention

```java
// Using JPA repositories
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId")
    List<Product> findByCategoryId(@Param("categoryId") Long categoryId);
}
```

### XSS Protection

```typescript
// Sanitizing user input
import DOMPurify from 'dompurify';

const sanitizedDescription = DOMPurify.sanitize(description);
```

## 🧪 Testing Strategy

### Unit Testing

```typescript
// Frontend unit test
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard {...mockProps} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

```java
// Backend unit test
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    void shouldCreateProduct() {
        // Test implementation
    }
}
```

### Integration Testing

```java
@SpringBootTest
@AutoConfigureTestDatabase
class ProductControllerIntegrationTest {
    @Test
    void shouldGetAllProducts() {
        // Integration test implementation
    }
}
```

## 📈 Performance Optimization

### Frontend Optimizations

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Browser and CDN caching
- **Bundle Analysis**: Webpack bundle analyzer

### Backend Optimizations

- **Connection Pooling**: HikariCP configuration
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries
- **Async Processing**: Non-blocking operations

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Type checking
        run: npm run type-check
```

## 📚 API Documentation

### OpenAPI/Swagger Integration

```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
            .paths(PathSelectors.any())
            .build();
    }
}
```

Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check API Gateway CORS configuration
   - Verify allowed origins in SecurityConfig

2. **JWT Token Issues**
   - Check token expiration
   - Verify JWT secret configuration
   - Ensure proper token format

3. **Database Connection Issues**
   - Check MySQL service status
   - Verify connection string
   - Check database credentials

4. **Service Communication Issues**
   - Verify service ports
   - Check API Gateway routing
   - Ensure services are running

### Debug Mode

```bash
# Frontend debug mode
DEBUG=* npm run dev

# Backend debug mode
java -jar app.jar --debug
```

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Email: tech-support@inventorysystem.com
- Documentation: [Link to full docs]

---

**Last Updated**: December 2024
**Version**: 1.0.0
