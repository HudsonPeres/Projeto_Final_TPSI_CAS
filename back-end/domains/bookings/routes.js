import { Router } from "express";
import Booking from "./models.js";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import Place from "../places/models.js";
import User from "../users/model.js";
import { isAdmin } from "../../utils/adminMiddleware.js";
import DeletedBooking from "./deletedModel.js";
import { isSuperAdmin } from "../../utils/adminMiddleware.js";
import { isSupport } from "../../utils/adminMiddleware.js";
import { Conversation, Message } from "../chat/models.js";
import { generateBookingCode } from "../../utils/bookingCode.js";

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
    // 1. Buscar o lugar
    const placeDoc = await Place.findById(place);
    if (!placeDoc)
      return res.status(404).json({ message: "Lugar não encontrado" });

    // 2. Validar número de participantes
    if (guests > placeDoc.guests) {
      return res
        .status(400)
        .json({ message: "Limite de participantes acima do permitido" });
    }

    const startDate = new Date(checkin);
    const endDate = new Date(checkout);

    // 3. Verificar se todas as datas estão dentro de availableDates (se o array existir e não for vazio)
    if (placeDoc.availableDates && placeDoc.availableDates.length > 0) {
      let allAvailable = true;
      let current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split("T")[0];
        const isAvailable = placeDoc.availableDates.some((d) => {
          const dStr =
            d instanceof Date
              ? d.toISOString().split("T")[0]
              : new Date(d).toISOString().split("T")[0];
          return dStr === dateStr;
        });
        if (!isAvailable) {
          allAvailable = false;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      if (!allAvailable)
        return res.status(409).json({ message: "Data não disponível" });
    }

    // 4. Verificar conflito com outras reservas confirmadas
    const checkinMs = startDate.getTime();
    const checkoutMs = endDate.getTime();

    const conflictingBooking = await Booking.findOne({
      place,
      status: "confirmed",
      $expr: {
        $and: [
          {
            $lt: [
              { $dateFromString: { dateString: "$checkin" } },
              new Date(checkoutMs),
            ],
          },
          {
            $gt: [
              { $dateFromString: { dateString: "$checkout" } },
              new Date(checkinMs),
            ],
          },
        ],
      },
    });
    if (conflictingBooking) {
      return res.status(409).json({ message: "Data já reservada" });
    }

    const bookingCode = generateBookingCode();
    // 5. Criar a reserva
    const newBookingDoc = await Booking.create({
      place,
      user,
      price,
      total,
      checkin,
      checkout,
      guests,
      nights,
      status: "confirmed",
      bookingCode,
    });

    // 6. Enviar mensagem automática de sistema (com código da reserva)
    try {
      const placeInfo = await Place.findById(place);
      if (placeInfo && placeInfo.owner) {
        const guestId = user;
        const hostId = placeInfo.owner;

        // Verificar se já existe conversa entre os dois utilizadores
        let conversation = await Conversation.findOne({
          participants: { $all: [guestId, hostId], $size: 2 },
          place: place,
        });
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [guestId, hostId],
            place: place,
          });
        }

        // Formatar datas para português
        const startFormatted = new Date(checkin).toLocaleDateString("pt-PT");
        const endFormatted = new Date(checkout).toLocaleDateString("pt-PT");

        const systemMessage =
          `📅 **Reserva confirmada!**\n\n` +
          `**Código da reserva:** \`${bookingCode}\`\n` +
          `**Experiência:** ${placeInfo.title}\n` +
          `**Datas:** ${startFormatted} a ${endFormatted}\n` +
          `**Participantes:** ${guests}\n` +
          `**Preço total:** €${total}\n\n` +
          `Guarde este código para futuras referências. Qualquer dúvida, responda a esta mensagem.`;

        await Message.create({
          conversation: conversation._id,
          sender: null,
          text: systemMessage,
          isSystem: true,
          read: false,
        });
      }
    } catch (chatError) {
      console.error(
        "Erro ao enviar mensagem automática de reserva:",
        chatError,
      );
    }

    res.json(newBookingDoc);
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    res.status(500).json("Erro ao criar a reserva");
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
  const reason = req.body?.reason || "Removida por administrador";
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

router.get("/place/:placeId/owner", async (req, res) => {
  connectDB();
  const { placeId } = req.params;
  try {
    const { _id: userId } = await JWTVerify(req);
    const place = await Place.findById(placeId);
    if (!place)
      return res.status(404).json({ message: "Anúncio não encontrado" });
    if (place.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Acesso negado. Você não é o dono deste anúncio." });
    }
    const bookings = await Booking.find({ place: placeId }).populate(
      "user",
      "name email",
    );
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao buscar reservas");
  }
});

router.patch("/:id/cancel/owner", async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const { _id: userId } = await JWTVerify(req);
    const booking = await Booking.findById(id).populate("place");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });
    if (booking.place.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Não autorizado" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Reserva cancelada com sucesso", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao cancelar reserva");
  }
});

router.delete("/:id/delete/owner", async (req, res) => {
  connectDB();
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const { _id: userId } = await JWTVerify(req);
    const booking = await Booking.findById(id).populate("place");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });
    if (booking.place.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Não autorizado" });
    }
    if (booking.status !== "cancelled") {
      return res
        .status(400)
        .json({ message: "Apenas reservas canceladas podem ser apagadas" });
    }

    // Obter nome do anunciante
    const ownerUser = await User.findById(userId);
    const ownerName = ownerUser?.name || "Anunciante desconhecido";

    // Registrar na coleção de auditoria (deletedbookings)
    await DeletedBooking.create({
      originalId: booking._id,
      data: booking.toObject(),
      deletedBy: userId,
      reason: reason || `Apagado pelo anunciante: ${ownerName}`,
    });

    await Booking.deleteOne({ _id: id });
    res.json({
      message: "Reserva apagada permanentemente e registrada em auditoria",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao apagar reserva");
  }
});

router.get("/deleted/all", isSuperAdmin, async (req, res) => {
  connectDB();
  try {
    const deleted = await DeletedBooking.find().populate(
      "deletedBy",
      "name email",
    );
    res.json(deleted);
  } catch (error) {
    res.status(500).json("Erro ao buscar reservas deletadas");
  }
});

router.delete("/deleted/:id", isSuperAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    await DeletedBooking.findByIdAndDelete(id);
    res.json({ message: "Registro apagado permanentemente" });
  } catch (error) {
    res.status(500).json("Erro ao apagar registro");
  }
});

router.get("/support/all", isSupport, async (req, res) => {
  connectDB();
  try {
    const bookings = await Booking.find()
      .populate("place", "title photos")
      .populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar reservas" });
  }
});

export default router;
