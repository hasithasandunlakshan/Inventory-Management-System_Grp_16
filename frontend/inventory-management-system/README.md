# Inventory Management System

A comprehensive, full-stack inventory management solution built with modern technologies and microservices architecture.

## 🚀 Overview

The Inventory Management System is a complete solution for managing inventory, orders, suppliers, and analytics. It features role-based access control, real-time updates, and cross-platform support.

## 🏗️ Architecture

### Technology Stack

| Component          | Technology                             | Purpose                            |
| ------------------ | -------------------------------------- | ---------------------------------- |
| **Frontend Web**   | Next.js 14 + TypeScript + Tailwind CSS | Modern, responsive web application |
| **Backend**        | Spring Boot 3 + Java 17                | Microservices architecture         |
| **Mobile**         | React Native                           | Cross-platform mobile application  |
| **Database**       | MySQL                                  | Centralized data storage           |
| **API Gateway**    | Spring Cloud Gateway                   | Request routing and authentication |
| **Authentication** | JWT (JSON Web Tokens)                  | Secure user authentication         |
| **Image Storage**  | Cloudinary                             | Professional image hosting         |
| **Deployment**     | Docker + Docker Compose                | Containerized deployment           |

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Admin Panel   │
│  (React Native) │    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │  (Port 8090)    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Service   │    │ Product Service │    │  Order Service  │
│   (Port 8081)   │    │   (Port 8083)   │    │   (Port 8084)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │Inventory Service│    │Supplier Service │    │Payment Service  │
         │   (Port 8085)   │    │   (Port 8086)   │    │   (Port 8087)   │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MySQL DB      │
                    │  (Port 3306)    │
                    └─────────────────┘
```

## 👥 User Roles & Permissions

### Role Hierarchy (Priority Order)

```
ADMIN > MANAGER > Supplier > Store Keeper > Driver > USER
```

### Role Descriptions

| Role | Description | Access |
| ---- | ----------- | ------ |
| **ADMIN** | Full system access, user management, system settings | Web App - Full Access |
| **MANAGER** | Business operations, analytics, inventory, orders, drivers, vehicles | Web App - Manager Dashboard |
| **Supplier** | View orders, manage deliveries, update inventory | Web App - Supplier Dashboard |
| **Store Keeper** | Manage products, categories, inventory, stock updates | Web/Mobile - QR Stock Updates |
| **Driver** | View assignments, update delivery status | Mobile App Only |
| **USER** | Basic access, view own orders | Mobile App - Customer |

### Detailed Permissions

| Feature | ADMIN | MANAGER | Supplier | Store Keeper | Driver | USER |
| ------- | ----- | ------- | -------- | ------------ | ------ | ---- |
| Dashboard Overview | ✅ | ✅ | ✅ | ✅ | Mobile | Mobile |
| Products (Add/Edit/Delete) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Categories | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Inventory Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Sales Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sales Forecast | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Orders | ✅ | ✅ | ✅ | ✅ | Mobile | Mobile |
| Suppliers | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Drivers Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Vehicles Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assignments | ✅ | ✅ | ❌ | ❌ | Mobile | ❌ |
| QR Stock Updates | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mobile Shopping | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.8+
- **MySQL** 8.0+
- **Git**
- **Docker** (optional, for containerized deployment)

### 📦 Installation & Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

#### 2. Database Setup

```bash
# Create MySQL databases for each service
mysql -u root -p

CREATE DATABASE userservice_db;
CREATE DATABASE productservice_db;
CREATE DATABASE orderservice_db;
CREATE DATABASE supplierservice_db;
CREATE DATABASE resourceservice_db;
```

#### 3. Backend Setup

**Start each backend service in a separate terminal:**

```bash
# Terminal 1: API Gateway (Port 8090)
cd backend/ApiGateway
mvn clean install
mvn spring-boot:run

# Terminal 2: User Service (Port 8081)
cd backend/userservice
mvn clean install
mvn spring-boot:run

# Terminal 3: Product Service (Port 8083)
cd backend/productservice
mvn clean install
mvn spring-boot:run

# Terminal 4: Order Service (Port 8084)
cd backend/Orderservice
mvn clean install
mvn spring-boot:run

# Terminal 5: Supplier Service (Port 8082)
cd backend/supplierservice
mvn clean install
mvn spring-boot:run

# Terminal 6: Resource Service (Port 8086)
cd backend/resourseservice
mvn clean install
mvn spring-boot:run
```

#### 4. Frontend Setup

```bash
cd frontend/inventory-management-system

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
# NEXT_PUBLIC_RESOURCE_SERVICE_URL=http://localhost:8086
# NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8081

# Start development server
npm run dev
```

#### 5. Access the Application

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:8090

### 🔑 Default Login Credentials

| Role | Username | Password | Dashboard |
| ---- | -------- | -------- | --------- |
| **ADMIN** | admin123 | password123 | /dashboard/manager |
| **MANAGER** | manager123 | password123 | /dashboard/manager |
| **Supplier** | supplier123 | password123 | /dashboard/supplier |
| **Store Keeper** | storekeeper123 | password123 | /dashboard/store-keeper |
| **Driver** | driver123 | password123 | Mobile App |
| **USER** | user123 | password123 | Mobile App |

## 📱 Features

### Dashboard

- **Real-time Analytics**: Revenue, orders, inventory metrics
- **Interactive Charts**: Bar charts, line charts, pie charts, donut charts
- **Role-based Views**: Different dashboards for different user roles
- **Quick Actions**: Common tasks easily accessible

### Product Management

- **CRUD Operations**: Create, read, update, delete products
- **Image Upload**: Cloudinary integration for professional image hosting
- **Category Management**: Organize products by categories
- **Stock Management**: Track inventory levels and stock movements
- **Barcode Support**: Generate and scan product barcodes

### Order Management

- **Order Processing**: Complete order lifecycle management
- **Customer Management**: Track customer information and order history
- **Payment Integration**: Process payments and refunds
- **Order Tracking**: Real-time order status updates

### Inventory Analytics

- **Stock Status**: Visual representation of stock levels
- **Movement Tracking**: Monitor incoming and outgoing stock
- **Category Distribution**: Analyze inventory by product categories
- **Low Stock Alerts**: Automated notifications for low inventory

### Supplier Management

- **Supplier Profiles**: Complete supplier information management
- **Performance Tracking**: Monitor delivery performance and quality
- **Purchase Orders**: Create and manage purchase orders
- **Delivery Logs**: Track supplier deliveries and performance

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions based on user roles
- **API Gateway Protection**: Centralized authentication and authorization
- **CORS Configuration**: Secure cross-origin resource sharing

## 🔧 Development

### Project Structure

```
inventory-management-system/
├── frontend/
│   └── inventory-management-system/
│       ├── src/
│       │   ├── app/                 # Next.js app router
│       │   ├── components/          # Reusable components
│       │   ├── lib/                 # Utilities and services
│       │   ├── hooks/               # Custom React hooks
│       │   └── types/               # TypeScript type definitions
│       ├── public/                  # Static assets
│       └── package.json
├── backend/
│   ├── ApiGateway/                  # API Gateway service
│   ├── userservice/                 # User management service
│   ├── productservice/              # Product management service
│   ├── orderservice/                # Order management service
│   ├── inventoryservice/            # Inventory management service
│   ├── supplierservice/             # Supplier management service
│   └── paymentservice/              # Payment processing service
└── mobile/                          # React Native mobile app
```

### Available Scripts

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

#### Backend

```bash
mvn spring-boot:run  # Start Spring Boot application
mvn clean install    # Clean and install dependencies
mvn test            # Run tests
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

## 🧪 Testing

### Frontend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ProductCard.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests for specific pattern
npm test -- --testPathPattern="product"
```

**Test Files Location:** `frontend/inventory-management-system/__tests__/`

**What's Tested:**
- Component rendering and UI
- User interactions (clicks, form submissions)
- Data display and formatting
- Role-based visibility
- Error handling

### Backend Testing

```bash
# Run all tests for a service
cd backend/userservice
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run all tests and skip on failure
mvn test -DfailIfNoTests=false

# Clean, install, and test
mvn clean install
```

**Test Coverage:**
- Unit tests for services
- Integration tests for controllers
- Repository tests
- Security/authentication tests

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Roles          |
| ------ | -------------------- | ----------------- | -------------- |
| POST   | `/api/auth/login`    | User login        | All            |
| POST   | `/api/auth/register` | User registration | All            |
| POST   | `/api/auth/logout`   | User logout       | All            |
| GET    | `/api/auth/users`    | Get all users     | ADMIN, MANAGER |

### Product Endpoints

| Method | Endpoint             | Description        | Roles   |
| ------ | -------------------- | ------------------ | ------- |
| GET    | `/api/products`      | Get all products   | MANAGER |
| POST   | `/api/products`      | Create product     | MANAGER |
| PUT    | `/api/products/{id}` | Update product     | MANAGER |
| DELETE | `/api/products/{id}` | Delete product     | MANAGER |
| GET    | `/api/categories`    | Get all categories | MANAGER |

### Order Endpoints

| Method | Endpoint           | Description       | Roles                 |
| ------ | ------------------ | ----------------- | --------------------- |
| GET    | `/api/orders`      | Get all orders    | STORE_KEEPER, MANAGER |
| POST   | `/api/orders`      | Create order      | STORE_KEEPER, MANAGER |
| PUT    | `/api/orders/{id}` | Update order      | STORE_KEEPER, MANAGER |
| GET    | `/api/orders/{id}` | Get order details | STORE_KEEPER, MANAGER |

## 🚀 Deployment

### Local Development

**Prerequisites Checklist:**
- ✅ MySQL running on port 3306
- ✅ All 6 backend services running (ports 8081-8086, 8090)
- ✅ Frontend running on port 3000
- ✅ Environment variables configured

### Production Build

#### Frontend (Next.js)

```bash
cd frontend/inventory-management-system

# Build for production
npm run build

# Test production build locally
npm start

# Production build will be in .next/ folder
```

#### Backend (Spring Boot)

```bash
# Build JAR files for each service
cd backend/userservice
mvn clean package -DskipTests

# Repeat for all services:
# - ApiGateway
# - userservice
# - productservice
# - Orderservice
# - supplierservice
# - resourseservice

# JAR files will be in target/ folder of each service
```

### Docker Deployment

```bash
# Build and start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

**Access:**
- Web App: http://localhost:3000
- API Gateway: http://localhost:8090

### Cloud Deployment

#### Recommended Platforms:

**Frontend (Next.js):**
- **Vercel** (Recommended): Automatic Next.js optimization
- **Netlify**: Easy deployment with Git integration
- **AWS Amplify**: Full-stack deployment

**Backend (Spring Boot):**
- **AWS EC2/ECS**: Scalable container hosting
- **Google Cloud Run**: Serverless containers
- **Azure App Service**: Managed Java hosting
- **Railway**: Simple deployment for microservices

**Database:**
- **AWS RDS**: Managed MySQL
- **Google Cloud SQL**: Managed databases
- **PlanetScale**: Serverless MySQL

#### Deployment Steps (Example: Vercel + AWS):

1. **Deploy Frontend to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Deploy Backend to AWS ECS:**
   - Create Docker images for each service
   - Push to Amazon ECR
   - Deploy to ECS with load balancer

3. **Configure Environment Variables:**
   - Update `NEXT_PUBLIC_API_BASE_URL` to production API Gateway URL
   - Set database connection strings in backend services
   - Configure CORS for production domains

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
NEXT_PUBLIC_RESOURCE_SERVICE_URL=http://localhost:8086
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_SUPPLIER_SERVICE_URL=http://localhost:8082
```

**Backend (application.properties):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/[service]_db
spring.datasource.username=root
spring.datasource.password=your_password
jwt.secret=your_jwt_secret_key
```

## 🔒 Security

### Authentication Flow

1. User logs in with credentials
2. Backend validates credentials
3. JWT token generated with user role
4. Token stored in secure HTTP-only cookie
5. All subsequent requests include token
6. API Gateway validates token and role
7. Request forwarded to appropriate service

### Security Features

- **JWT Token Authentication**: Secure, stateless authentication
- **Role-based Access Control**: Granular permissions
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## 📈 Performance

### Frontend Optimizations

- **Next.js SSR/SSG**: Server-side rendering for better performance
- **Image Optimization**: Automatic image optimization with Next.js Image
- **Code Splitting**: Automatic code splitting for smaller bundles
- **Caching**: Browser caching for static assets

### Backend Optimizations

- **Connection Pooling**: Database connection pooling
- **Caching**: Redis caching for frequently accessed data
- **Load Balancing**: Multiple service instances
- **Database Indexing**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: Next.js, TypeScript, Tailwind CSS
- **Backend Development**: Spring Boot, Java, MySQL
- **Mobile Development**: React Native
- **DevOps**: Docker, Docker Compose

## 🔧 Troubleshooting

### Common Issues

**"Error loading initial data" in Dashboard:**
- Ensure all backend services are running
- Check environment variables are set correctly
- Verify API Gateway is accessible

**Supplier/Store Keeper login redirects incorrectly:**
- Role must match exactly: "Supplier" or "Store Keeper" (case-sensitive)
- Check database role names match priority array

**CORS errors:**
- Verify CORS configuration in API Gateway
- Check allowed origins include your frontend URL

**Database connection failed:**
- Ensure MySQL is running on port 3306
- Verify database names match application.properties
- Check username/password in configuration

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :[PORT]
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:[PORT] | xargs kill -9
```

## 📞 Support

For support, email support@inventorysystem.com or create an issue in the repository.

## 🔄 Changelog

### Version 1.0.0

- Initial release
- Complete inventory management system
- Role-based authentication (ADMIN, MANAGER, Supplier, Store Keeper, Driver, USER)
- Real-time analytics dashboard
- Mobile application support (React Native)
- QR code stock updates
- Driver and vehicle management
- Assignment coordination with area clustering
- Sales forecasting
- Cloudinary image integration
- Modern UI with Inter font and blue theme

## 📸 Screenshots

See `docs/images/` folder for application screenshots and `docs/User_Manual.md` for detailed guides.

## 📄 Documentation

- **User Manual**: `docs/User_Manual.md` - Role-based user guide with screenshot references
- **Presentation**: `docs/Presentation.md` - Slide deck for demos and presentations
- **API Documentation**: See API sections above
- **Architecture**: See System Architecture diagram above

---

**Built with ❤️ by Group 16 using modern web technologies**
