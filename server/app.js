const express = require("express");
const https = require("https"); // Use the https module
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Import JWT
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes"); // Path to the router file
const dashboardRoutes = require("./routes/dashboards");
const chatRoutes = require("./routes/chatRoutes");
const uniRouter = require("./routes/uniRoutes");
const documenteRouter = require("./routes/documents");
const path = require("path");
const { getUserRoleFromToken, getUserIdFromToken } = require("./auth_functions/authHelpers");
const socketIo = require("socket.io");
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
  passphrase: 'lexa'
};

// Create HTTPS server
const server = https.createServer(credentials, app);
const io = socketIo(server);

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
app.set("io", io);

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/chat", chatRoutes(io));
app.use("/uni", uniRouter);
app.use("/documents", documenteRouter);
app.get("/", (req, res) => {
  res.redirect(`/auth/login`);
});

// AUTH
const prisma = new PrismaClient();

// SOCKET FUNCTIONALITY
let clients = {
  users: [],
  admins: [],
};
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("authenticate", async (token) => {
    try {
      const userRole = await getUserRoleFromToken(token);
      const userId = await getUserIdFromToken(token);

      if (!userRole || !userId) {
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      socket.role = userRole === "admin" ? "admin" : "user";

      if (!clients[userId]) {
        clients[userId] = socket;
      }

      // Load chat history
      const chatHistory = await prisma.chat.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { createdAt: "asc" },
      });

      socket.emit("chatHistory", chatHistory);
      console.log(`${socket.role} authenticated with ID: ${userId}`);
    } catch (error) {
      console.error("Authentication error:", error);
      socket.disconnect();
    }
  });

  socket.on("sendMessage", async ({ message, to }) => {
    const from = socket.userId;
    const timestamp = new Date();

    // Save message to database
    await prisma.chat.create({
      data: {
        message,
        senderId: from,
        receiverId: to,
        createdAt: timestamp,
      },
    });

    if (clients[to]) {
      clients[to].emit("receiveMessage", { message, from, timestamp });
    }

    console.log(`Message from ${from} to ${to}: ${message}`);
  });

  socket.on("register", (role) => {
    if (role === "user") {
      clients.users.push(socket);
      socket.role = "user";
      console.log("User registered");
    } else if (role === "admin") {
      clients.admins.push(socket);
      socket.role = "admin";
      console.log("Admin registered");
    }
  });

  socket.on("sendNotification", (message) => {
    if (socket.role === "admin") {
      clients.users.forEach((userSocket) => {
        userSocket.emit("notification", { message });
      });
      console.log("Notification sent by admin");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    if (socket.role === "user") {
      clients.users = clients.users.filter(
        (userSocket) => userSocket !== socket
      );
    } else if (socket.role === "admin") {
      clients.admins = clients.admins.filter(
        (adminSocket) => adminSocket !== socket
      );
    }
  });
});

// Port configuration
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
