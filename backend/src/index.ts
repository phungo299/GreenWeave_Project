import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
// @ts-ignore
dotenv.config();

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
  stripeRoutes,
  uploadRoutes,
  userRoutes,
  visitorLogRoutes,
  wishlistRoutes
} from "./routes";

const app = express();

// Load swagger document
const swaggerPath = path.resolve(__dirname, "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);

// Update swagger server URL from env
swaggerDocument.servers[0].url = process.env.API_URL || "http://localhost:5000";

// Allow all origins for development
console.log("CORS: Allowing all origins for development");

app.use(
  cors({
    origin: true, // Allow all origins
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "GreenWeave API Documentation"
}));

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
app.use("/api/stripe", stripeRoutes);
app.use("/api/upload", uploadRoutes);

// Export the app for testing purposes
export { app };

// Only start the server if this file is run directly (not imported as a module)
if (require.main === module) {
  const port = process.env.PORT || 5000;

  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGO_URI?.split('@')[1]); // Log URI an toàn (không hiện credentials)

  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log("Connected to MongoDB successfully");
      app.listen(port, () => {
        console.log(`Server started at ${new Date().toISOString()}`);
        console.log(`Server is running on port ${port}`);
        console.log(`API Documentation available at ${process.env.API_URL || `http://localhost:${port}`}/api-docs`);
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
