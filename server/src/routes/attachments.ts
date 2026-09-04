import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getPrisma } from "../prisma.js";
import { mockAuthMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(mockAuthMiddleware);

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

router.post("/", (req: Request, res: Response) => {
  upload.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Bad Request", message: "File exceeds maximum size of 5MB." });
      }
      return res.status(400).json({ error: "Bad Request", message: err.message });
    } else if (err) {
      return res.status(400).json({ error: "Bad Request", message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Bad Request", message: "No file uploaded." });
    }

    try {
      const attachment = await getPrisma().attachment.create({
        data: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          storageUrl: req.file.filename // store filename to retrieve later
        }
      });

      res.status(201).json(attachment);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const requesterId = res.locals.requesterId;
  const attachmentId = req.params.id;
  const isDownload = req.query.download === "true";

  try {
    const attachment = await getPrisma().attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true }
    });

    if (!attachment || attachment.deletedAt) {
      return res.status(404).json({ error: "Not Found", message: "Attachment not found or deleted" });
    }

    if (attachment.ticket && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this attachment" });
    }

    if (isDownload) {
      const filePath = path.join(uploadDir, attachment.storageUrl);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Not Found", message: "File missing on disk" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${attachment.fileName}"`);
      res.setHeader("Content-Type", attachment.mimeType);
      return res.sendFile(filePath);
    }

    res.status(200).json(attachment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const requesterId = res.locals.requesterId;
  const attachmentId = req.params.id;

  try {
    const attachment = await getPrisma().attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true }
    });

    if (!attachment || attachment.deletedAt) {
      return res.status(404).json({ error: "Not Found", message: "Attachment not found or already removed" });
    }

    if (attachment.ticket && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this attachment" });
    }

    await getPrisma().attachment.update({
      where: { id: attachmentId },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({ message: "Attachment successfully removed." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
