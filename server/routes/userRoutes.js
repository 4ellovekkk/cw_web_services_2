const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("../auth_functions/authHelpers");
const cors = require("cors");

// Enable CORS for React front-end
router.use(
  cors({
    origin: "http://localhost:3000", // Replace with your React app's URL
    credentials: true, // Allow cookies to be sent
  }),
);

// GET user by ID for editing
router.get("/edit-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;

    // Check user role
    if ((await getUserRoleFromToken(token)) !== 1) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user by ID
    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data as JSON
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// PUT request to update user information
router.put("/edit-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = await getUserRoleFromToken(token);
    if (userRole === null) {
      return res.status(500).json({ message: "Error fetching user role" });
    }

    const id = parseInt(req.params.id);
    if (userRole === 3 && userId !== id) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    const {
      first_name,
      midle_name,
      last_name,
      phone,
      user_role,
      username,
      passwd,
    } = req.body;

    // Update user data
    let updateData = {
      first_name,
      midle_name,
      last_name,
      phone,
      user_role,
      username,
    };

    if (passwd && passwd.trim() !== "") {
      updateData.passwd = await bcrypt.hash(passwd, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user information" });
  }
});

// DELETE request to delete a user
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.cookies;

    // Check user role
    const userRole = await getUserRoleFromToken(token);
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    // Delete user
    const deletedUser = await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// PUT request to lock a user
router.put("/lock/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);

    if (userRole === 3) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    const userIdToLock = req.params.id;
    if (!userIdToLock) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToLock = await prisma.users.findUnique({
      where: { id: parseInt(userIdToLock) },
    });

    if (!userToLock) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await prisma.users.update({
      where: { id: parseInt(userIdToLock) },
      data: { is_locked: true },
    });

    res.json({ message: "User locked successfully", user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error locking user" });
  }
});

// PUT request to unlock a user
router.put("/unlock/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);

    if (userRole === 3) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    const userIdToUnlock = req.params.id;
    if (!userIdToUnlock) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToUnlock = await prisma.users.findUnique({
      where: { id: parseInt(userIdToUnlock) },
    });

    if (!userToUnlock) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await prisma.users.update({
      where: { id: parseInt(userIdToUnlock) },
      data: { is_locked: false },
    });

    res.json({ message: "User unlocked successfully", user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unlocking user" });
  }
});

// GET user details by ID
router.get("/view-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = await getUserRoleFromToken(token);
    const userId = await getUserIdFromToken(token);

    if (userRole === null || !userId) {
      return res
        .status(500)
        .json({ message: "Error fetching user role or ID" });
    }

    const requestedUserId = parseInt(req.params.id);

    // Restrict regular users (role 3) to their own information
    if (userRole === 3 && userId !== requestedUserId) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    // Fetch user data
    const user = await prisma.users.findUnique({
      where: { id: requestedUserId },
      select: {
        id: true,
        first_name: true,
        midle_name: true,
        last_name: true,
        phone: true,
        username: true,
        user_role: true,
        user_type: true,
        is_locked: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch additional data based on user_type
    let additionalInfo = null;
    if (user.user_type === "student") {
      additionalInfo = await prisma.students.findUnique({
        where: { id: requestedUserId },
        select: {
          faculty: true,
          specialty: true,
          group_number: true,
          is_headman: true,
        },
      });
    } else if (user.user_type === "worker") {
      additionalInfo = await prisma.workers.findUnique({
        where: { id: requestedUserId },
        select: {
          position: true,
          is_dean: true,
        },
      });
    }

    res.json({ user, additionalInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user information" });
  }
});

// GET list of users
router.get("/list", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = await getUserRoleFromToken(token);
    if (userRole === 3) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    const { filter, orderBy } = req.query;

    // Initialize Prisma query options
    const queryOptions = {
      where: {},
      orderBy: [],
      include: {
        role: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
    };

    // Add filtering and ordering logic
    if (filter) {
      queryOptions.where.OR = [
        { username: { contains: filter } },
        { id: { equals: parseInt(filter) || undefined } },
        { role: { role_name: { contains: filter } } },
      ];
    }

    if (orderBy) {
      const [field, direction] = orderBy.split(":");
      const validFields = ["username", "id", "role_name"];
      const validDirections = ["asc", "desc"];

      if (
        validFields.includes(field) &&
        validDirections.includes(direction.toLowerCase())
      ) {
        if (field === "role_name") {
          queryOptions.orderBy.push({
            role: { role_name: direction.toLowerCase() },
          });
        } else {
          queryOptions.orderBy.push({ [field]: direction.toLowerCase() });
        }
      }
    }

    // Fetch users
    const users = await prisma.users.findMany(queryOptions);
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
