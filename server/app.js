
const express = require("express");
const https = require("https");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboards");
const uniRouter = require("./routes/uniRoutes");
const documenteRouter = require("./routes/documents");
const path = require("path");
const { getUserRoleFromToken, getUserIdFromToken } = require("./auth_functions/authHelpers");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Read SSL certificate and key
const privateKey = fs.readFileSync("./ca.key", "utf8");
const certificate = fs.readFileSync("./ca.pem", "utf8");
const ca = fs.readFileSync("./ca.pem", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
  passphrase: "lexa",
};

// Create HTTPS server
const server = https.createServer(credentials, app);

// CORS Configuration
const corsOptions = {
  origin: ["https://localhost:5173"], // Ensure this matches your frontend's origin
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Required headers
};

// CORS Middleware (Fix: Properly closed function)
app.use((req, res, next) => {
  res.setHeader("charset", "utf-8");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Use CORS
app.use(cors(corsOptions));

// Other Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../react-ts", "dist")));

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/uni", uniRouter);
app.use("/documents", documenteRouter);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../react-ts", "index.html"));
});

// Prisma Client
const prisma = new PrismaClient();

// Port Configuration
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

