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

### Role Hierarchy

```
ADMIN > MANAGER > STORE KEEPER > USER > SUPPLIER
```

### Role Permissions

| Role             | Dashboard | Products | Orders | Analytics | Settings | Suppliers |
| ---------------- | --------- | -------- | ------ | --------- | -------- | --------- |
| **ADMIN**        | ✅        | ✅       | ✅     | ✅        | ✅       | ✅        |
| **MANAGER**      | ✅        | ✅       | ✅     | ✅        | ❌       | ✅        |
| **STORE KEEPER** | ✅        | ✅       | ✅     | ❌        | ❌       | ✅        |
| **USER**         | ✅        | ❌       | ❌     | ❌        | ❌       | ❌        |
| **SUPPLIER**     | ✅        | ❌       | ❌     | ❌        | ❌       | ❌        |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Java 17+
- MySQL 8.0+
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend/inventory-management-system
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Start backend services**

   ```bash
   # Start API Gateway
   cd backend/ApiGateway
   mvn spring-boot:run

   # Start other services in separate terminals
   cd backend/userservice
   mvn spring-boot:run

   cd backend/productservice
   mvn spring-boot:run
   ```

5. **Access the application**
   - Web App: http://localhost:3000
   - API Gateway: http://localhost:8090

### Default Login Credentials

| Role         | Username       | Password    |
| ------------ | -------------- | ----------- |
| Admin        | admin123       | password123 |
| Manager      | manager123     | password123 |
| Store Keeper | storekeeper123 | password123 |
| User         | user123        | password123 |

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
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Backend Testing

```bash
mvn test            # Run all tests
mvn test -Dtest=ClassName # Run specific test class
```

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

### Docker Deployment

1. **Build and start all services**

   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Web App: http://localhost:3000
   - API Gateway: http://localhost:8090

### Production Deployment

1. **Build frontend**

   ```bash
   npm run build
   ```

2. **Build backend services**

   ```bash
   mvn clean package -DskipTests
   ```

3. **Deploy to your preferred cloud platform**

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

## 📞 Support

For support, email support@inventorysystem.com or create an issue in the repository.

## 🔄 Changelog

### Version 1.0.0

- Initial release
- Complete inventory management system
- Role-based authentication
- Real-time analytics dashboard
- Mobile application support
- Cloudinary image integration

---

**Built with ❤️ using modern web technologies**
