const express = require("express");
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken")
const {getUserRoleFromToken, getUserIdFromToken} = require("../auth_functions/authHelpers");
router.get("/user-dashboard", async (req, res) => {
    if (parseInt(await getUserRoleFromToken(req.cookies.token)) !== 3) {
        return res.status(401).json({message: "Insufficient privileges"});
    }
    const userId = await getUserIdFromToken(req.cookies.token); // Получаем id пользователя из токена

    if (!userId) {
        return res.status(401).json({error: "Unauthorized"});
    }

    // Получение текущей даты
    const currentDate = new Date();

    res.render("user-dashboard", {currentDate});
});

router.get("/admin-dashboard", async (req, res) => {
    res.render("admin-dashboard");
})

router.get("/worker-dashboard", async (req, res) => {
    res.render("worker-dashboard");
})
module.exports = router;
