const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const router = express.Router();
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("../auth_functions/authHelpers");

// GET user by ID for editing
router.get("/edit-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);
    if (userRole !== 1) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

// PUT request to update user information
router.put("/edit-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = await getUserIdFromToken(token);
    const userRole = await getUserRoleFromToken(token);

    if (!userId || (userRole === 3 && userId !== parseInt(req.params.id))) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    let updateData = { ...req.body };
    if (updateData.passwd) {
      updateData.passwd = await bcrypt.hash(updateData.passwd, 10);
    }
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating user information" });
  }
});

// DELETE request to delete a user
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);
    if (userRole !== 1 && userRole !== 2) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    await prisma.users.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

// PUT request to lock/unlock a user
router.put("/:action(lock|unlock)/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);
    if (userRole === 3) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    const isLocked = req.params.action === "lock";
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(req.params.id) },
      data: { is_locked: isLocked },
    });
    res.json({
      success: true,
      data: updatedUser,
      message: `User ${isLocked ? "locked" : "unlocked"} successfully`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating user lock status" });
  }
});

// GET user details by ID
router.get("/view-user/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = await getUserIdFromToken(token);
    const userRole = await getUserRoleFromToken(token);
    const requestedUserId = parseInt(req.params.id);

    if (userRole === 3 && userId !== requestedUserId) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    const user = await prisma.users.findUnique({
      where: { id: requestedUserId },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user information" });
  }
});

// GET list of users
router.get("/list", async (req, res) => {
  try {
    const token = req.cookies.token;
    const userRole = await getUserRoleFromToken(token);
    if (userRole === 3) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient privileges" });
    }

    const users = await prisma.users.findMany();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

module.exports = router;
