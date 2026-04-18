import { Router } from "express";
import Place from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDB } from "../../config/db.js";
import { __dirname } from "../../server.js";
import { sendtoS3, downloadImage, uploadImage } from "./controller.js";
import { resolve } from "url";

const router = Router();

router.post("/", async (req, res) => {
  connectDB();
  const {
    title,
    address,
    photos,
    description,
    extras,
    perks,
    price,
    checkin,
    checkout,
    guests,
  } = req.body;

  try {
    const { _id: owner } = await JWTVerify(req);
    const newPlaceDoc = await Place.create({
      owner,
      title,
      address,
      photos,
      description,
      extras,
      perks,
      price,
      checkin,
      checkout,
      guests,
    });

    res.json(newPlaceDoc);
  } catch (error) {
    res.status(500).json("Erro ao criar");
  }
});

router.post("/upload/link", async (req, res) => {
  const { link } = req.body;
  const path = `${__dirname}/tmp/`;
  try {
    const { filename, fullPath, mimeType } = await downloadImage(link);

    const fileURL = await sendtoS3(filename, fullPath, mimeType);

    res.json({ filename: fileURL });
  } catch (error) {
    console.error("Erro route:", error);
    res.status(500).json("Erro ao baixar imagem");
  }
});

router.post("/upload", uploadImage().array("files", 10), async (req, res) => {
  const { files } = req;

  const filesPromise = new Promise((resolve, reject) => {
    const fileURLArray = [];

    files.forEach(async (file, index) => {
      const { filename, path, mimetype } = file;

      try {
        const fileURL = await sendtoS3(filename, path, mimetype);

        fileURLArray.push(fileURL);
      } catch (error) {
        console.error("Erro ao subir para o S3");
        reject(error);
      }
    });
    const idInterval = setInterval(() => {
      if (files.length === fileURLArray.length) {
        clearInterval(idInterval);
        resolve(fileURLArray);
      }
    }, 100);
  });

  const fileURLArrayResolved = await filesPromise;

  const path = `${__dirname}/tmp/`;

  res.json(fileURLArrayResolved);
});

export default router;
