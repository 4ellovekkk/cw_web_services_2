const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient, Prisma } = require("@prisma/client");
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("../auth_functions/authHelpers");
const prisma = new PrismaClient();
const router = express.Router();
router.get("/register", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);

    if (userRole !== parseInt(1)) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    jwt.verify(token, "secret_key");
    res.json({ message: "Access granted" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(500).json({ message: "Verification error" });
    }
  }
});

// GET Login - No rendering, just status
router.get("/login", (req, res) => {
  res.json({ message: "Please log in" }); // React will redirect based on state
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Поиск пользователя по имени пользователя
    const user = await prisma.users.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is locked
    if (user.is_locked) {
      return res.status(403).json({ error: "User account is locked" });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwd);
    // isPasswordValid=true;
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      "secret_key",
      {
        expiresIn: "24h",
      },
    );

    // Установка токена как cookie
    res.cookie("token", token, { httpOnly: true, secure: true });

    // Получение роли пользователя из токена
    const userRole = await getUserRoleFromToken(token);

    // Отправка роли пользователя в ответе
    res.json({ role: userRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
});
// GET Logout - Clear cookie and send status
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});
module.exports = router;
