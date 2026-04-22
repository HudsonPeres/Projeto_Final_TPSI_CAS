import { Router } from "express";
import Booking from "./models.js";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import Place from "../places/models.js";
import User from "../users/model.js";

const router = Router();

router.get("/owner", async (req, res) => {
  connectDB();

  try {
    const { _id: id } = await JWTVerify(req);

    try {
      const bookingDocs = await Booking.find({ user: id }).populate("place");
      res.json(bookingDocs);
    } catch (error) {
      console.log(error);
      res.status(500).json("erro ao encontrar reservas deste usuário");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("erro ao validar o token do usuário");
  }
});

router.post("/", async (req, res) => {
  connectDB();
  const { place, user, price, total, checkin, checkout, guests, nights } =
    req.body;

  try {
    const newBookingDoc = await Booking.create({
      place,
      user,
      price,
      total,
      checkin,
      checkout,
      guests,
      nights,
    });

    res.json(newBookingDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao criar a reserva ");
  }
});

export default router;
