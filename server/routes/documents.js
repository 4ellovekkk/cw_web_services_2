const express = require("express");
const router = express.Router();
const {PrismaClient, Prisma} = require("@prisma/client");
const prisma = new PrismaClient();
const {getUserRoleFromToken, getUserIdFromToken} = require("../auth_functions/authhelpers"); // Assuming utility functions exist

// Helper function to handle database errors
function handleDatabaseError(error, res, customMessage) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma error code:", error.code);
        res.status(400).json({error: customMessage || "Database operation failed."});
    } else {
        console.error(error);
        res.status(500).json({error: customMessage || "Internal server error."});
    }
}

// Get documents page (only accessible by admin)
router.get("/", async (req, res) => {
    const token = req.cookies.token;
    const userId = await getUserIdFromToken(token);
    if (!userId) {
        return res.status(401).send("Unauthorized");
    }
    if (await getUserRoleFromToken(token) !== 1) {
        return res.status(403).json({message: "Insufficient privileges"});
    }
    const documentTypes = await prisma.document_types.findMany();
    const documents = await prisma.documents.findMany(); // Assuming you want to fetch documents as well
    res.render("documents", {documents, documentTypes});
});


router.get("/documents", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {document_type_id, is_approved, page = 1, limit = 10} = req.query;
        const filters = {};

        if (document_type_id) filters.document_type_id = parseInt(document_type_id);
        if (is_approved) filters.is_approved = is_approved === "true";

        const documents = await prisma.documents.findMany({
            where: filters,
            include: {document_type: true},
            skip: (page - 1) * limit,
            take: parseInt(limit),
        });

        res.status(200).json(documents); // Return filtered documents
    } catch (error) {
        handleDatabaseError(error, res, "Failed to fetch documents.");
    }
});
router.post("/documents", async (req, res) => {
    try {
        const token = req.cookies.token;

        // Check user role
        const userRole = await getUserRoleFromToken(token);
        if (userRole !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        // Get user ID
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const {document_type_id, content, is_approved, is_dean_required} = req.body;

        // Validate input
        if (!document_type_id || !content) {
            return res.status(400).json({message: "document_type_id and content are required."});
        }

        const doctype = parseInt(document_type_id);
        if (isNaN(doctype)) {
            return res.status(400).json({message: "document_type_id must be a valid number."});
        }

        // Create document
        const newDocument = await prisma.documents.create({
            data: {
                content,
                created_at: new Date(),
                updated_at: new Date(),
                is_approved: Boolean(parseInt(is_approved)),
                is_dean_required: Boolean(parseInt(is_dean_required)),
                users: {
                    connect: {id: userId},
                },
                document_types: {
                    connect: {id: doctype},
                },
            },
        });

        res.status(201).json(newDocument);
    } catch (error) {
        console.error("Error creating document:", error);
        handleDatabaseError(error, res, "Failed to create document.");
    }
});
router.get("/documents/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;

        const document = await prisma.documents.findUnique({
            where: {id: parseInt(id)},
            include: {document_type: true}, // Include related document type
        });

        if (!document) {
            return res.status(404).json({message: "Document not found"});
        }

        res.status(200).json(document); // Return the document data
    } catch (error) {
        handleDatabaseError(error, res, "Failed to fetch document.");
    }
});
// Edit a document
router.put("/documents/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;
        const {content, is_approved, is_dean_required} = req.body;

        const updatedDocument = await prisma.documents.update({
            where: {id: parseInt(id)},
            data: {
                content,
                is_approved: Boolean(is_approved),  // Ensure is_approved is a number
                is_dean_required: Boolean(is_dean_required),  // Ensure is_dean_required is a number
            },
        });

        res.status(200).json(updatedDocument);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to update document.");
    }
});

// Delete a document
router.delete("/documents/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;

        await prisma.documents.delete({
            where: {id: parseInt(id)},
        });

        res.status(204).send();
    } catch (error) {
        handleDatabaseError(error, res, "Failed to delete document.");
    }
});
router.get("/document-types", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const documentTypes = await prisma.document_types.findMany();
        res.status(200).json(documentTypes); // Return all document types
    } catch (error) {
        handleDatabaseError(error, res, "Failed to fetch document types.");
    }
});
// Add a document type
router.post("/document-types", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {document_name, is_payment_mandatory} = req.body;

        const newDocumentType = await prisma.document_types.create({
            data: {
                document_name,
                is_payment_mandatory: Boolean(is_payment_mandatory),  // Ensure is_payment_mandatory is a number
            },
        });

        res.status(201).json(newDocumentType);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to create document type.");
    }
});
router.get("/document-types/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;

        const documentType = await prisma.document_types.findUnique({
            where: {id: parseInt(id)},
        });

        if (!documentType) {
            return res.status(404).json({message: "Document type not found"});
        }

        res.status(200).json(documentType); // Return the document type data
    } catch (error) {
        handleDatabaseError(error, res, "Failed to fetch document type.");
    }
});
// Edit a document type
router.put("/document-types/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;
        const {document_name, is_payment_mandatory} = req.body;

        const updatedDocumentType = await prisma.document_types.update({
            where: {id: parseInt(id)},
            data: {
                document_name,
                is_payment_mandatory: Boolean(is_payment_mandatory),  // Ensure is_payment_mandatory is a number
            },
        });

        res.status(200).json(updatedDocumentType);
    } catch (error) {
        handleDatabaseError(error, res, "Failed to update document type.");
    }
});

// Delete a document type
router.delete("/document-types/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }
        if (await getUserRoleFromToken(token) !== 1) {
            return res.status(403).json({message: "Insufficient privileges"});
        }

        const {id} = req.params;

        await prisma.document_types.delete({
            where: {id: parseInt(id)},
        });

        res.status(204).send();
    } catch (error) {
        handleDatabaseError(error, res, "Failed to delete document type.");
    }
});
router.get('/search', async (req, res) => {
    const searchQuery = req.query.q || ''; // Get search query from URL parameters or default to an empty string

    try {
        // Query the database with Prisma
        const filteredTypes = await prisma.document_types.findMany({
            where: {
                document_name: {
                    contains: searchQuery, // Partial matching (case-sensitive)
                },
            },
            orderBy: {id: 'asc'}, // Order results by ID
        });

        // Render the EJS page with filtered data
        res.render('document-types-search', {documentTypes: filteredTypes, query: searchQuery});
    } catch (error) {
        console.error("Error fetching document types:", error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
