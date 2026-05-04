import { Router } from "express";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import Review from "./model.js";
import Booking from "../bookings/models.js";

const router = Router();

const getUserId = async (req) => {
  const user = await JWTVerify(req);
  return user._id;
};

router.post("/", async (req, res) => {
  connectDB();
  try {
    const userId = await getUserId(req);
    const { bookingId, ratingHost, ratingExperience, comment, type } = req.body;

    if (!bookingId)
      return res.status(400).json({ message: "ID da reserva obrigatório" });
    if (!["host", "guest", "experience"].includes(type)) {
      return res.status(400).json({ message: "Tipo de avaliação inválido" });
    }

    const booking = await Booking.findById(bookingId).populate("place");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });

    // Verificar se o utilizador está autorizado a avaliar
    if (type === "host") {
      // O hóspede avalia o anfitrião
      if (booking.user.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Apenas o hóspede pode avaliar o anfitrião" });
      }
      const existing = await Review.findOne({
        booking: bookingId,
        reviewer: userId,
        type: "host",
      });
      if (existing)
        return res
          .status(409)
          .json({ message: "Já avaliou este anfitrião para esta reserva" });

      // Verificar prazo 7 dias após checkout
      const checkoutDate = new Date(booking.checkout);
      const now = new Date();
      const diffDays = (now - checkoutDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 7)
        return res.status(400).json({
          message: "Prazo para avaliar expirou (7 dias após checkout)",
        });

      const review = await Review.create({
        booking: bookingId,
        reviewer: userId,
        target: booking.place.owner,
        place: booking.place._id,
        ratingHost,
        comment,
        type,
        expiresAt: new Date(checkoutDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
      return res.status(201).json(review);
    }

    if (type === "guest") {
      // O anfitrião avalia o hóspede
      if (booking.place.owner.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Apenas o anfitrião pode avaliar o hóspede" });
      }
      const existing = await Review.findOne({
        booking: bookingId,
        reviewer: userId,
        type: "guest",
      });
      if (existing)
        return res
          .status(409)
          .json({ message: "Já avaliou este hóspede para esta reserva" });

      const checkoutDate = new Date(booking.checkout);
      const now = new Date();
      const diffDays = (now - checkoutDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 7)
        return res.status(400).json({ message: "Prazo para avaliar expirou" });

      const review = await Review.create({
        booking: bookingId,
        reviewer: userId,
        target: booking.user,
        ratingHost,
        comment,
        type,
        expiresAt: new Date(checkoutDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
      return res.status(201).json(review);
    }

    if (type === "experience") {
      // O hóspede avalia a experiência
      if (booking.user.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Apenas o hóspede pode avaliar a experiência" });
      }
      const existing = await Review.findOne({
        booking: bookingId,
        reviewer: userId,
        type: "experience",
      });
      if (existing)
        return res
          .status(409)
          .json({ message: "Já avaliou esta experiência para esta reserva" });

      const checkoutDate = new Date(booking.checkout);
      const now = new Date();
      const diffDays = (now - checkoutDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 7)
        return res.status(400).json({ message: "Prazo expirou" });

      const review = await Review.create({
        booking: bookingId,
        reviewer: userId,
        target: booking.place.owner, // ou null?
        place: booking.place._id,
        ratingExperience,
        comment,
        type,
        expiresAt: new Date(checkoutDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
      return res.status(201).json(review);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar avaliação" });
  }
});

router.get("/user/:userId", async (req, res) => {
  connectDB();
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ target: userId }).populate(
      "reviewer",
      "name",
    );
    const totalHost = reviews.filter((r) => r.type === "host").length;
    const totalGuest = reviews.filter((r) => r.type === "guest").length;
    const avgHost =
      reviews
        .filter((r) => r.type === "host" && r.ratingHost)
        .reduce((a, b) => a + b.ratingHost, 0) / (totalHost || 1);
    const avgGuest =
      reviews
        .filter((r) => r.type === "guest" && r.ratingHost)
        .reduce((a, b) => a + b.ratingHost, 0) / (totalGuest || 1);
    res.json({ reviews, avgHost, avgGuest, totalHost, totalGuest });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar avaliações" });
  }
});

router.get("/place/:placeId", async (req, res) => {
  connectDB();
  try {
    const { placeId } = req.params;
    const reviews = await Review.find({
      place: placeId,
      type: "experience",
    }).populate("reviewer", "name");
    const total = reviews.length;
    const avg =
      reviews.reduce((a, b) => a + b.ratingExperience, 0) / (total || 1);
    res.json({ reviews, avg, total });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar avaliações do anúncio" });
  }
});

export default router;
