# Design Conventions - GreenWeave Project

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Frontend Conventions](#frontend-conventions)
3. [Backend Conventions](#backend-conventions)
4. [Shared Conventions](#shared-conventions)
5. [Examples & Templates](#examples--templates)

---

## Tổng quan

### Nguyên tắc thiết kế cốt lõi
- **Consistency**: Đảm bảo tính nhất quán trong toàn bộ codebase
- **Maintainability**: Code dễ bảo trì và mở rộng
- **Readability**: Code dễ đọc và hiểu
- **Scalability**: Kiến trúc có thể mở rộng
- **Performance**: Tối ưu hiệu suất

### Tech Stack
- **Frontend**: React.js, CSS3, React Router
- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

---

## Frontend Conventions

### 1. File Structure & Naming

#### Cấu trúc thư mục
```
src/
├── components/          # Reusable components
│   ├── common/         # Common components
│   ├── layout/         # Layout components
│   └── ui/            # UI components
├── pages/             # Page components
├── adminpages/        # Admin-specific pages
├── personalpage/      # User personal pages
├── sections/          # Page sections
├── assets/           # Static assets
├── context/          # React contexts
├── services/         # API services
├── routes/           # Route configurations
└── utils/            # Utility functions
```

#### Naming Conventions
- **Files**: PascalCase cho components (`ProductCard.jsx`)
- **Folders**: camelCase (`productcard/`)
- **CSS Files**: Cùng tên với component (`ProductCard.css`)
- **Constants**: UPPER_SNAKE_CASE (`PRODUCTS_PER_PAGE`)

### 2. React Component Patterns

#### Component Structure
```jsx
import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

/**
 * Component description
 * @param {Object} props
 * @param {string} props.propName - Prop description
 */
const ComponentName = ({ 
    propName,
    optionalProp = 'defaultValue',
    ...otherProps 
}) => {
    // State declarations
    const [state, setState] = useState(initialValue);
    
    // Effect hooks
    useEffect(() => {
        // Effect logic
    }, [dependencies]);
    
    // Event handlers
    const handleEvent = (e) => {
        // Handler logic
    };
    
    // Render helpers
    const renderHelper = () => {
        return <div>Helper content</div>;
    };
    
    return (
        <div className="component-name">
            {/* Component JSX */}
        </div>
    );
};

ComponentName.propTypes = {
    propName: PropTypes.string.isRequired,
    optionalProp: PropTypes.string
};

export default memo(ComponentName);
```

#### Component Categories
1. **UI Components** (`components/ui/`): Reusable UI elements
2. **Layout Components** (`components/layout/`): Page structure components
3. **Page Components** (`pages/`): Route-level components
4. **Section Components** (`sections/`): Large page sections

### 3. CSS/Styling Guidelines

#### CSS Class Naming (BEM-inspired)
```css
/* Block */
.product-card { }

/* Element */
.product-card__image { }
.product-card__title { }
.product-card__price { }

/* Modifier */
.product-card--featured { }
.product-card__button--disabled { }
```

#### CSS File Structure
```css
/* Component styles */
.component-name {
    /* Layout properties */
    display: flex;
    position: relative;
    
    /* Box model */
    width: 100%;
    padding: 1rem;
    margin: 0;
    
    /* Typography */
    font-size: 1rem;
    color: #333;
    
    /* Visual */
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    
    /* Animation */
    transition: all 0.3s ease;
}

/* States */
.component-name:hover { }
.component-name.active { }
.component-name.disabled { }

/* Responsive */
@media (max-width: 768px) {
    .component-name {
        /* Mobile styles */
    }
}
```

#### CSS Variables (Global)
```css
:root {
    /* Colors */
    --primary-color: #2c5530;
    --secondary-color: #4a7c59;
    --accent-color: #8fbc8f;
    --text-color: #333;
    --background-color: #f8f9fa;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Typography */
    --font-family: 'Inter', sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
}
```

### 4. State Management

#### Context Pattern
```jsx
// AuthContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, user: action.payload, isAuthenticated: true };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

### 5. Route Structure

#### Route Organization
```jsx
// publicRoutes.js
const publicRoutes = [
    { path: '/', component: LandingPage },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/products', component: ProductOverviewPage },
    { path: '/products/:id', component: ProductDetails }
];

// privateRoutes.js
const privateRoutes = [
    { path: '/cart', component: CartPage },
    { path: '/checkout', component: CheckoutPage },
    { path: '/personal/*', component: Personal }
];

// adminRoutes.js
const adminRoutes = [
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            { path: '', component: AdminDashboard },
            { path: 'products', component: AdminProductList },
            { path: 'orders', component: AdminOrderList }
        ]
    }
];
```

---

## Backend Conventions

### 1. Project Structure

```
src/
├── controllers/        # Request handlers
├── models/            # Database models
├── routes/            # Route definitions
├── services/          # Business logic
├── middleware/        # Custom middleware
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── errors/            # Custom error classes
└── tests/             # Test files
```

### 2. API Design Patterns

#### RESTful API Structure
```
GET    /api/products           # Get all products
GET    /api/products/:id       # Get product by ID
POST   /api/products           # Create new product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
GET    /api/products/search    # Search products
```

#### Controller Pattern
```typescript
// productController.ts
import { Request, Response } from 'express';
import { Product } from '../models';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, categoryId } = req.query;
        
        const query = categoryId ? { categoryId } : {};
        const skip = (Number(page) - 1) * Number(limit);
        
        const products = await Product.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
            
        const total = await Product.countDocuments(query);
        
        return res.status(200).json({
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
```

#### Response Format Standards
```typescript
// Success Response
{
    "success": true,
    "data": { /* response data */ },
    "message": "Operation successful"
}

// Error Response
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": { /* error details */ }
    }
}

// Paginated Response
{
    "data": [ /* items */ ],
    "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "totalPages": 10
    }
}
```

### 3. Database Model Conventions

#### Model Structure
```typescript
// Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: mongoose.Types.ObjectId;
    variants: IProductVariant[];
    isFeatured: boolean;
    rating: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface IProductVariant {
    color: string;
    size: string;
    stock: number;
    imageUrl: string;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: [{
        color: { type: String, required: true },
        size: { type: String, required: true },
        stock: { type: Number, required: true, min: 0 },
        imageUrl: { type: String, default: '' }
    }],
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ isFeatured: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
```

### 4. Middleware Patterns

#### Authentication Middleware
```typescript
// auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthRequest extends Request {
    user?: {
        _id: string;
        role: 'admin' | 'user' | 'guest';
    };
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        req.user = {
            _id: user._id.toString(),
            role: user.role
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
```

### 5. Error Handling

#### Custom Error Classes
```typescript
// errors/CustomError.ts
export class CustomError extends Error {
    public statusCode: number;
    public code: string;
    
    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
    }
}

export class ValidationError extends CustomError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

export class NotFoundError extends CustomError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
```

---

## Shared Conventions

### 1. Git Workflow

#### Branch Naming
- `main` - Production branch
- `develop` - Development branch
- `feature/feature-name` - Feature branches
- `bugfix/bug-description` - Bug fix branches
- `hotfix/critical-fix` - Hotfix branches

#### Commit Messages
```
type(scope): description

feat(auth): add JWT token refresh functionality
fix(product): resolve price calculation bug
docs(api): update authentication endpoints
style(ui): improve button hover effects
refactor(db): optimize product query performance
test(auth): add unit tests for login flow
```

### 2. Documentation Standards

#### Code Comments
```typescript
/**
 * Calculates the total price including tax and shipping
 * @param items - Array of cart items
 * @param shippingCost - Shipping cost in VND
 * @param taxRate - Tax rate as decimal (0.1 for 10%)
 * @returns Total price including all fees
 */
const calculateTotal = (
    items: CartItem[], 
    shippingCost: number, 
    taxRate: number
): number => {
    // Implementation
};
```

#### API Documentation (Swagger)
```yaml
/api/products:
  get:
    tags:
      - Products
    summary: Get all products
    parameters:
      - name: page
        in: query
        description: Page number
        schema:
          type: integer
          default: 1
    responses:
      '200':
        description: List of products retrieved successfully
```

### 3. Testing Patterns

#### Unit Test Structure
```typescript
// product.test.ts
import { getProducts } from '../controllers/productController';
import { Product } from '../models';

describe('Product Controller', () => {
    describe('getProducts', () => {
        it('should return paginated products', async () => {
            // Arrange
            const mockProducts = [/* mock data */];
            jest.spyOn(Product, 'find').mockResolvedValue(mockProducts);
            
            // Act
            const result = await getProducts(mockReq, mockRes);
            
            // Assert
            expect(result.status).toBe(200);
            expect(result.data.products).toEqual(mockProducts);
        });
    });
});
```

---

## Examples & Templates

### 1. New Component Template

```jsx
// ComponentTemplate.jsx
import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import './ComponentTemplate.css';

/**
 * Component description
 * @param {Object} props
 */
const ComponentTemplate = ({ 
    requiredProp,
    optionalProp = 'default',
    ...otherProps 
}) => {
    const [localState, setLocalState] = useState(null);
    
    useEffect(() => {
        // Effect logic
    }, []);
    
    const handleEvent = (e) => {
        // Event handler
    };
    
    return (
        <div className="component-template" {...otherProps}>
            {/* Component content */}
        </div>
    );
};

ComponentTemplate.propTypes = {
    requiredProp: PropTypes.string.isRequired,
    optionalProp: PropTypes.string
};

export default memo(ComponentTemplate);
```

### 2. New API Endpoint Template

```typescript
// Controller
export const createResource = async (req: Request, res: Response) => {
    try {
        const validatedData = validateInput(req.body);
        const resource = await ResourceService.create(validatedData);
        
        return res.status(201).json({
            success: true,
            data: resource,
            message: 'Resource created successfully'
        });
    } catch (error) {
        return handleError(error, res);
    }
};

// Route
router.post('/', authenticateToken, validateResource, createResource);

// Service
export class ResourceService {
    static async create(data: CreateResourceDto): Promise<IResource> {
        const resource = new Resource(data);
        return await resource.save();
    }
}
```

### 3. New Page Template

```jsx
// PageTemplate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import './PageTemplate.css';

const PageTemplate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchData();
    }, [id]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch data logic
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error">Error: {error}</div>;
    
    return (
        <div className="page-template">
            <Header />
            <main className="page-content">
                {/* Page content */}
            </main>
            <Footer />
        </div>
    );
};

export default PageTemplate;
```

---

## Checklist cho Developer

### Trước khi commit:
- [ ] Code tuân thủ naming conventions
- [ ] Components có PropTypes/TypeScript types
- [ ] CSS classes tuân thủ BEM convention
- [ ] API endpoints có proper error handling
- [ ] Database models có proper validation
- [ ] Code có comments đầy đủ
- [ ] Tests đã được viết và pass
- [ ] No console.log trong production code
- [ ] Responsive design đã được test
- [ ] Performance đã được optimize

### Trước khi tạo PR:
- [ ] Branch name tuân thủ convention
- [ ] Commit messages rõ ràng
- [ ] Code đã được review bởi ít nhất 1 người
- [ ] Documentation đã được update
- [ ] Breaking changes đã được ghi nhận
- [ ] Migration scripts (nếu cần) đã được tạo

---

*Tài liệu này sẽ được cập nhật thường xuyên theo sự phát triển của dự án.* 