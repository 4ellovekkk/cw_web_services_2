const {getUserRoleFromToken, getUserIdFromToken, handleDataba} = require("../auth_functions/authHelpers");
const express = require("express");
const {PrismaClient, Prisma} = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

function handleDatabaseError(error, res, customMessage) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma error code:", error.code);
        res.status(400).json({error: customMessage || "Database operation failed."});
    } else {
        console.error(error);
        res.status(500).json({error: customMessage || "Internal server error."});
    }
}

router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const faculties = await prisma.faculties.findMany();
        const specialties = await prisma.specialty.findMany();
        res.render("uni", {faculties, specialties});
    } catch (error) {
        handleDatabaseError(error, res, "Failed to access this page.");
    }
});

// Faculty Routes
router.post("/faculty", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const {faculty_name} = req.body;
        if (!faculty_name) {
            return res.status(400).json({error: "Faculty name is required."});
        }

        const newFaculty = await prisma.faculties.create({data: {faculty_name}});
        res.status(201).json(newFaculty);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to create faculty.");
    }
});

router.put("/faculty/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const {id} = req.params;
        const {faculty_name} = req.body;

        const updatedFaculty = await prisma.faculties.update({
            where: {id: parseInt(id)},
            data: {faculty_name},
        });

        res.status(200).json(updatedFaculty);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to update faculty.");
    }
});

router.delete("/faculty/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const {id} = req.params;
        await prisma.faculties.delete({where: {id: parseInt(id)}});
        res.status(204).send();
    } catch (error) {
        handleDatabaseError(error, res, "Failed to delete faculty.");
    }
});

// Specialty Routes
router.post("/specialty", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const {spec_name, faculty} = req.body;
        if (!spec_name || !faculty) {
            return res.status(400).json({error: "Specialty name and faculty ID are required."});
        }

        const newSpecialty = await prisma.specialty.create({
            data: {
                spec_name,
                faculty: parseInt(faculty),
            },
        });

        res.status(201).json(newSpecialty);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to create specialty.");
    }
});

router.put("/specialty/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {spec_name, faculty} = req.body;

        const updatedSpecialty = await prisma.specialty.update({
            where: {id: parseInt(id)},
            data: {
                spec_name,
                faculty: faculty ? parseInt(faculty) : undefined,
            },
        });

        res.status(200).json(updatedSpecialty);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to update specialty.");
    }
});

router.delete("/specialty/:id", async (req, res) => {
    try {
        const {id} = req.params;
        await prisma.specialty.delete({where: {id: parseInt(id)}});
        res.status(204).send();
    } catch (error) {
        handleDatabaseError(error, res, "Failed to delete specialty.");
    }
});

module.exports = router;
