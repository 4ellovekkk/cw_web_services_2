const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

async function getUserRoleFromToken(token) {
    try {
        const decodedToken = jwt.verify(token, "secret_key");
        const username = decodedToken.username;

        const user = await prisma.users.findUnique({
            where: {
                username: username,
            },
            include: {
                role: true,
            },
        });

        if (!user) {
            return null;
        }

        return user.role.id;
    } catch (error) {
        console.error("Ошибка при получении роли пользователя из токена:", error);
        return null;
    }
}

async function getUserIdFromToken(token) {
    try {
        const decodedToken = jwt.verify(token, "secret_key");
        return decodedToken.userId;
    } catch (error) {
        console.error("Ошибка при получении id пользователя из токена:", error);
        return null;
    }
}

module.exports = {
    getUserRoleFromToken,
    getUserIdFromToken
};
