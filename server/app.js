const express = require("express");
const https = require("https"); // Use the https module
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Import JWT
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes"); // Path to the router file
const dashboardRoutes = require("./routes/dashboards");
const uniRouter = require("./routes/uniRoutes");
const documenteRouter = require("./routes/documents");
const path = require("path");
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("./auth_functions/authHelpers");
const app = express();
const cookieParser = require("cookie-parser");

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

// MIDDLEWARE

const cors = require("cors");
const corsOptions = {
  origin: ["localhost:5173"],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/uni", uniRouter);
app.use("/documents", documenteRouter);
app.get("/", (req, res) => {
  res.redirect(`/auth/login`);
});

// AUTH
const prisma = new PrismaClient();
// Port configuration
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
