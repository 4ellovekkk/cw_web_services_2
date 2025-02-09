const express = require("express");
const router = express.Router();
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  getUserRoleFromToken,
  getUserIdFromToken,
} = require("../auth_functions/authhelpers");

// Helper function to handle database errors
function handleDatabaseError(error, res, customMessage) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma error code:", error.code);
    res
      .status(400)
      .json({ error: customMessage || "Database operation failed." });
  } else {
    console.error(error);
    res.status(500).json({ error: customMessage || "Internal server error." });
  }
}

// Middleware for authentication and role check
async function authenticateAdmin(req, res, next) {
  try {
    const token = req.cookies.token;
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = await getUserRoleFromToken(token);
    if (userRole !== 1) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }

    req.userId = userId; // Pass user ID to the next middleware
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
}

// Get all documents with optional filters
router.get("/documents", authenticateAdmin, async (req, res) => {
  try {
    const { document_type_id, is_approved, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (document_type_id) filters.document_type_id = parseInt(document_type_id);
    if (is_approved) filters.is_approved = is_approved === "true";

    const documents = await prisma.documents.findMany({
      where: filters,
      include: { document_type: true },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    res.status(200).json(documents);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to fetch documents.");
  }
});

// Create a new document
router.post("/documents", authenticateAdmin, async (req, res) => {
  try {
    const { document_type_id, content, is_approved, is_dean_required } =
      req.body;

    if (!document_type_id || !content) {
      return res
        .status(400)
        .json({ message: "document_type_id and content are required." });
    }

    const newDocument = await prisma.documents.create({
      data: {
        content,
        created_at: new Date(),
        updated_at: new Date(),
        is_approved: Boolean(is_approved),
        is_dean_required: Boolean(is_dean_required),
        users: { connect: { id: req.userId } },
        document_types: { connect: { id: parseInt(document_type_id) } },
      },
    });

    res.status(201).json(newDocument);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to create document.");
  }
});

// Get a document by ID
router.get("/documents/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.documents.findUnique({
      where: { id: parseInt(id) },
      include: { document_type: true },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to fetch document.");
  }
});

// Update a document
router.put("/documents/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_approved, is_dean_required } = req.body;

    const updatedDocument = await prisma.documents.update({
      where: { id: parseInt(id) },
      data: {
        content,
        is_approved: Boolean(is_approved),
        is_dean_required: Boolean(is_dean_required),
      },
    });

    res.status(200).json(updatedDocument);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to update document.");
  }
});

// Delete a document
router.delete("/documents/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.documents.delete({ where: { id: parseInt(id) } });

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(error, res, "Failed to delete document.");
  }
});

// Get all document types
router.get("/document-types", authenticateAdmin, async (req, res) => {
  try {
    const documentTypes = await prisma.document_types.findMany();
    res.status(200).json(documentTypes);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to fetch document types.");
  }
});

// Create a new document type
router.post("/document-types", authenticateAdmin, async (req, res) => {
  try {
    const { document_name, is_payment_mandatory } = req.body;

    const newDocumentType = await prisma.document_types.create({
      data: {
        document_name,
        is_payment_mandatory: Boolean(is_payment_mandatory),
      },
    });

    res.status(201).json(newDocumentType);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to create document type.");
  }
});

// Get a document type by ID
router.get("/document-types/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const documentType = await prisma.document_types.findUnique({
      where: { id: parseInt(id) },
    });

    if (!documentType) {
      return res.status(404).json({ message: "Document type not found" });
    }

    res.status(200).json(documentType);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to fetch document type.");
  }
});

// Update a document type
router.put("/document-types/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { document_name, is_payment_mandatory } = req.body;

    const updatedDocumentType = await prisma.document_types.update({
      where: { id: parseInt(id) },
      data: {
        document_name,
        is_payment_mandatory: Boolean(is_payment_mandatory),
      },
    });

    res.status(200).json(updatedDocumentType);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to update document type.");
  }
});

// Delete a document type
router.delete("/document-types/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.document_types.delete({ where: { id: parseInt(id) } });

    res.status(204).send();
  } catch (error) {
    handleDatabaseError(error, res, "Failed to delete document type.");
  }
});

// Search document types
router.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q || "";

    const filteredTypes = await prisma.document_types.findMany({
      where: {
        document_name: { contains: searchQuery, mode: "insensitive" },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json(filteredTypes);
  } catch (error) {
    handleDatabaseError(error, res, "Failed to search document types.");
  }
});

module.exports = router;
