const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("../auth_functions/authHelpers");

router.get("/home", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = await getUserIdFromToken(token);
    const userRole = parseInt(await getUserRoleFromToken(token));

    if (!userId || userRole === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Получение текущей даты
    const currentDate = new Date();

    let dashboardData = { currentDate, userRole };

    if (userRole === 3) {
      dashboardData.page = "user-dashboard";
    } else if (userRole === 2) {
      dashboardData.page = "worker-dashboard";
    } else if (userRole === 1) {
      dashboardData.page = "admin-dashboard";
    } else {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

module.exports = router;
