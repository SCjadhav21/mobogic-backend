const express = require("express");

const multer = require("multer");
const path = require("path");
const { fileModel } = require("../models/files.model");
const { Authentication } = require("../middelware/authentication");

const FileRoutes = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

FileRoutes.post(
  "/upload",
  upload.single("file"),
  Authentication,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      let userId = req.body.userId;
      const filePath = req.file.path;
      const fileName = req.file.filename;
      const filecode = generateCode();
      // console.log({ file: filePath, filecode, userId: req.body.userId });
      const file = new fileModel({ file: filePath, filecode, userId });
      await file.save();

      res.json({
        message: "File uploaded successfully",

        userId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

FileRoutes.get("/", Authentication, async (req, res) => {
  try {
    const files = await fileModel.find({ userId: req.body.userId });
    res.status(200).send(files);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
FileRoutes.delete("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    await fileModel.findByIdAndDelete(id);
    res.status(200).send("file deleted successfully");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

FileRoutes.get("/:fileId/download", Authentication, async (req, res) => {
  const fileId = req.params.fileId;

  try {
    const file = await fileModel.findOne({ filecode: fileId });

    if (!file) {
      return res
        .status(404)
        .json({ error: "File not found or incorrect code" });
    }
    const filePath = file.file;

    res.download(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { FileRoutes };
