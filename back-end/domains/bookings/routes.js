import { Router } from "express";
import Booking from "./models.js";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import Place from "../places/models.js";
import User from "../users/model.js";
import { isAdmin } from "../../utils/adminMiddleware.js";
import DeletedBooking from "./deletedModel.js";

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

router.get("/admin/all", isAdmin, async (req, res) => {
  connectDB();
  try {
    const bookings = await Booking.find()
      .populate("place", "title photos")
      .populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao buscar reservas");
  }
});

router.delete("/admin/:id", isAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  const { reason } = req.body; // motivo opcional

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json("Reserva não encontrada");

    const admin = req.user; // definido pelo middleware isAdmin

    // Salva no histórico de exclusão
    await DeletedBooking.create({
      originalId: booking._id,
      data: booking.toObject(),
      deletedBy: admin._id,
      reason: reason || "Removida por administrador",
    });

    await Booking.deleteOne({ _id: id });
    res.json({ message: "Reserva removida e registrada em auditoria" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao deletar reserva");
  }
});

router.patch("/admin/:id/cancel", isAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json("Reserva não encontrada");
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Reserva cancelada", status: booking.status });
  } catch (error) {
    res.status(500).json("Erro ao cancelar reserva");
  }
});

router.patch("/admin/:id/reactivate", isAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json("Reserva não encontrada");
    booking.status = "confirmed";
    await booking.save();
    res.json({ message: "Reserva reativada", status: booking.status });
  } catch (error) {
    res.status(500).json("Erro ao reativar reserva");
  }
});

export default router;
