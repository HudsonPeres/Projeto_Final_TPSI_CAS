import { Router } from "express";
import Place from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDB } from "../../config/db.js";
import { __dirname } from "../../server.js";
import { sendtoS3, downloadImage, uploadImage } from "./controller.js";
import { resolve } from "url";

const router = Router();

router.get("/", async (req, res) => {
  connectDB();
  try {
    const placeDocs = await Place.find();
    res.json(placeDocs);
  } catch (error) {
    res.status(500).json("Erro ao encontrar as acomodações");
  }
});

router.get("/owner", async (req, res) => {
  connectDB();
  try {
    const { _id: owner } = await JWTVerify(req);
    const placeDocs = await Place.find({ owner });
    res.json(placeDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao encontrar lugares do usuário");
  }
});

router.get("/:id", async (req, res) => {
  connectDB();

  const { id: _id } = req.params;

  try {
    const placeDoc = await Place.findOne({ _id });
    res.json(placeDoc);
  } catch (error) {
    res.status(500).json("Erro ao encontrar a acomodação");
  }
});

router.put("/:id", async (req, res) => {
  connectDB();

  const { id: _id } = req.params;
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
    const updatedPlaceDoc = await Place.findOneAndUpdate(
      { _id },
      {
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
      },
    );

    res.json(updatedPlaceDoc);
  } catch (error) {
    res.status(500).json("Erro ao atualizar");
  }
});

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
