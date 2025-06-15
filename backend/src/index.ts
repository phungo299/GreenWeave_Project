import "./loadEnv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import * as YAML from "yamljs";
import { startOrderExpiryJob } from "./jobs/orderExpiryJob";

// Routes
import {
  authRoutes,
  cartRoutes,
  categoryRoutes,
  messageRoutes,
  notificationRoutes,
  orderRoutes,
  paymentRoutes,
  productRoutes,
  promotionRoutes,
  reviewRoutes,
  settingRoutes,
  uploadRoutes,
  userRoutes,
  visitorLogRoutes,
  wishlistRoutes,
  payosRoutes
} from "./routes";

const app = express();

// Đọc file swagger.yaml đã được sinh tự động bởi script generate-swagger
const swaggerPath = path.resolve(__dirname, "./swagger.yaml");
let swaggerSpec: any | null = null;
if (fs.existsSync(swaggerPath)) {
  swaggerSpec = YAML.load(swaggerPath);
  console.log(`✅ Loaded Swagger documentation from ${swaggerPath}`);
} else {
  console.warn(`⚠️ Swagger file not found at ${swaggerPath}. API docs will be disabled.`);
}

// CORS Configuration - Environment Based
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://green-weave-project.vercel.app',
      'https://greenweave.vn',
      'https://www.greenweave.vn'
    ];

console.log("CORS: Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log unauthorized access attempt
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (_req, res) => {
  console.log("Log message on backend");
  res.send("Welcome to the GreenWeave API");
});

// When swaggerSpec is available, mount Swagger UI
if (swaggerSpec) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "GreenWeave API Documentation"
  }));
}

// Cấu hình routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/visitor-logs", visitorLogRoutes);
app.use("/api/payos", payosRoutes);
app.use("/api/upload", uploadRoutes);

// Export the app for testing purposes
export { app };

// Only start the server if this file is run directly (not imported as a module)
if (require.main === module) {
  const port: number = parseInt(process.env.PORT ?? '5000', 10);

  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGO_URI?.split('@')[1]); // Log URI an toàn (không hiện credentials)

  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log("Connected to MongoDB successfully");
      app.listen(port, '0.0.0.0', () => {
        console.log(`Server started at ${new Date().toISOString()}`);
        console.log(`Server is running on port ${port}`);
        console.log(`API Documentation available at ${process.env.API_URL || `http://localhost:${port}`}/api-docs`);

        // Start background jobs
        startOrderExpiryJob();
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error details:");
      console.error("Name:", error.name);
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      if (error.name === 'MongoServerError') {
        console.error("Please check your MongoDB credentials and database name");
      }
      process.exit(1); // Thoát process nếu không kết nối được database
    });
}

