import { Router } from "express";
import Place from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDB } from "../../config/db.js";

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
    const { _id: owner } = await JWTVerify(red);
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

export default router;
