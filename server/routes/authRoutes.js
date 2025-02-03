const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {PrismaClient, Prisma} = require("@prisma/client");
const {getUserRoleFromToken, getUserIdFromToken} = require("../auth_functions/authHelpers");
const prisma = new PrismaClient();
const router = express.Router();
router.get("/register", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userRole = await getUserRoleFromToken(token);

        if (userRole !== parseInt(1)) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        jwt.verify(token, "secret_key");
        res.json({message: "Access granted"});
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({message: "Token expired"});
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({message: "Invalid token"});
        } else {
            return res.status(500).json({message: "Verification error"});
        }
    }
});

// GET Login - No rendering, just status
router.get("/login", (req, res) => {
    res.json({message: "Please log in"}); // React will redirect based on state
});

// GET Logout - Clear cookie and send status
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({message: "Logged out successfully"});
});
module.exports = router;
