import { Router } from "express";
import Place from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDB } from "../../config/db.js";
import { downloadImage } from "../../utils/imageDownloader.js";
import { __dirname } from "../../server.js";

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
  try {
    const filename = await downloadImage(link, `${__dirname}/tmp/`);
    res.json({ filename });
  } catch (error) {
    res.status(500).json("Erro ao baixar imagem");
  }
});

export default router;
