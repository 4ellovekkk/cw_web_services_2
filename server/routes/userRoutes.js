const express = require("express");
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const {getUserRoleFromToken, getUserIdFromToken} = require("../auth_functions/authHelpers");
router.get("/edit-user/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        // Check user role
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        // Get userId from token
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        // Fetch user role
        const userRole = await getUserRoleFromToken(token);
        if (userRole === null) {
            return res.status(500).send("Error fetching user role");
        }

        // Find user by ID
        const user = await prisma.users.findUnique({
            where: {id: parseInt(req.params.id)}, // Use req.params.id here
        });

        if (!user) {
            return res.status(404).send("User not found");
        }

        console.log(req.params.id);
        // Render form with user data
        res.render("edit-user", {userId: req.params.id, user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching user");
    }
});


router.get("/edit-user", async (req, res) => {
    try {
        const token = req.cookies.token;

        // Get userId from token
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        // Fetch user role
        const userRole = await getUserRoleFromToken(token);
        if (userRole === null) {
            return res.status(500).send("Error fetching user role");
        }

        // Find user by ID
        const user = await prisma.users.findUnique({
            where: {id: userId}, // Use req.params.id here
        });

        if (!user) {
            return res.status(404).send("User not found");
        }

        console.log(userId);
        // Render form with user data
        res.render("edit-user", {userId: req.params.id, user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching user");
    }
});
// PUT запрос для обновления информации о пользователе
router.put("/edit-user/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Unauthorized");
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const userRole = await getUserRoleFromToken(token);
        if (userRole === null) {
            return res.status(500).send("Error fetching user role");
        }

        const id = parseInt(req.params.id);
        if (userRole === 3 && userId !== id) {
            return res.status(403).send("Insufficient privileges");
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

        // Обновление информации о пользователе в базе данных
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
            where: {
                id,
            },
            data: updateData,
        });

        res.json({
            message: "User information updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Error updating user information"});
    }
});

// DELETE запрос для удаления пользователя
router.delete("/delete-user/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {token} = req.cookies;

        // Получение роли пользователя из токена
        const userRole = await getUserRoleFromToken(token);

        // Проверка роли пользователя
        if (userRole !== 1 && userRole !== 2) {
            return res.status(403).json({error: "Insufficient privileges"});
        }

        // Удаление пользователя из базы данных
        const deletedUser = await prisma.users.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.json({message: "User deleted successfully", user: deletedUser});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Error deleting user"});
    }
});
router.put("/lock/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userRole = await getUserRoleFromToken(token);

        if (userRole == 3) {
            res.status(403).json({message: "Insufficient privileges"});
        }
        const userIdToLock = req.params.id; // Assuming the user ID to lock is sent in the request body

        if (!userIdToLock) {
            return res.status(400).send("User ID is required");
        }

        const userToLock = await prisma.users.findUnique({
            where: {id: parseInt(userIdToLock)}
        });

        if (!userToLock) {
            return res.status(404).send("User not found");
        }

        const result = await prisma.users.update({
            where: {id: parseInt(userIdToLock)},
            data: {is_locked: true}
        });

        res.json({message: "User locked successfully", user: result});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error locking user");
    }
});
router.put("/unlock/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userRole = await getUserRoleFromToken(token);

        if (userRole === 3) {
            res.status(403).send("Insufficient priveleges");
        }
        const userIdToLock = req.params.id;

        if (!userIdToLock) {
            return res.status(400).send("User ID is required");
        }

        const userToLock = await prisma.users.findUnique({
            where: {id: parseInt(userIdToLock)}
        });

        if (!userToLock) {
            return res.status(404).send("User not found");
        }

        const result = await prisma.users.update({
            where: {id: parseInt(userIdToLock)},
            data: {is_locked: false}
        });

        res.json({message: "User unlocked successfully", user: result});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error locking user");
    }
});
router.get("/view-user/:id", async (req, res) => {
    try {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({message: "Unauthorized"});
        }

        // Get user role and ID from token
        const userRole = await getUserRoleFromToken(token);
        const userId = await getUserIdFromToken(token);

        if (userRole === null || !userId) {
            return res.status(500).json({message: "Error fetching user role or ID"});
        }

        const requestedUserId = parseInt(req.params.id);

        // Restrict regular users (role 3) to their own information
        if (userRole === 3 && userId !== requestedUserId) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        // Fetch user data from the users table
        const user = await prisma.users.findUnique({
            where: {id: requestedUserId},
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
            return res.status(404).json({message: "User not found"});
        }

        // Fetch additional data based on user_type
        let additionalInfo = null;
        if (user.user_type === "student") {
            additionalInfo = await prisma.students.findUnique({
                where: {id: requestedUserId},
                select: {
                    faculty: true,
                    specialty: true,
                    group_number: true,
                    is_headman: true,
                },
            });
        } else if (user.user_type === "worker") {
            additionalInfo = await prisma.workers.findUnique({
                where: {id: requestedUserId},
                select: {
                    position: true,
                    is_dean: true,
                },
            });
        }
        res.render("view-user", {user, additionalInfo});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching user information"});
    }
});
router.get("/list", async (req, res) => {
    try {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({message: "Unauthorized"});
        }

        // Get user role and ID from token
        const userRole = await getUserRoleFromToken(token);
        const userId = await getUserIdFromToken(token);

        if (userRole === 3) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {filter, orderBy} = req.query;

        // Initialize Prisma query options
        const queryOptions = {
            where: {},
            orderBy: [],
            include: {
                role: {
                    select: {
                        id: true,       // Select role ID
                        role_name: true, // Select role_name for displaying
                    },
                },
            },
        };

        // Add filtering logic
        if (filter) {
            queryOptions.where.OR = [
                {
                    username: {
                        contains: filter,  // Search by username
                    },
                },
                {
                    id: {
                        equals: parseInt(filter) || undefined,  // Handle filtering by ID (integer)
                    },
                },
                {
                    role: {
                        role_name: {
                            contains: filter, // Search by role_name in the related role table
                        },
                    },
                },
            ];
        }

        // Add ordering logic
        if (orderBy) {
            const [field, direction] = orderBy.split(":");

            // Validate ordering input
            const validFields = ["username", "id", "role_name"];
            const validDirections = ["asc", "desc"];

            if (validFields.includes(field) && validDirections.includes(direction.toLowerCase())) {
                if (field === "role_name") {
                    // For ordering by role_name, order by the role's role_name field
                    queryOptions.orderBy.push({
                        role: {
                            role_name: direction.toLowerCase(), // Corrected ordering for role_name
                        },
                    });
                } else if (field === "id") {
                    // For ordering by user id, order directly on the users table
                    queryOptions.orderBy.push({
                        id: direction.toLowerCase(),
                    });
                } else {
                    queryOptions.orderBy.push({
                        [field]: direction.toLowerCase(),
                    });
                }
            }
        }

        // Fetch users from the database
        const users = await prisma.users.findMany(queryOptions);

        // Render the EJS page with fetched users
        res.render("list-users", {users});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching users."});
    }
});

module.exports = router;
