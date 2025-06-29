import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../services/s3Client.js";

// Multer config – store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadMiddleware = upload.single("file");

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Validate mime type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const s3Key = `media/${uuidv4()}${path.extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return res.status(200).json({
      s3Key,
      fileName: file.originalname,
      fileType: file.mimetype,
    });
  } catch (err) {
    console.error("S3 upload error", err);
    res.status(503).json({ error: "Upload failed" });
  }
};

export const generatePresignedUrl = async (s3Key) => {
  const getCmd = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });
  return getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
};
