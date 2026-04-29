import { Router } from "express";
import Booking from "./models.js";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import Place from "../places/models.js";
import User from "../users/model.js";
import {
  isAdmin,
  isSuperAdmin,
  isSupport,
  isSupportOrAdmin,
} from "../../utils/adminMiddleware.js";
import DeletedBooking from "./deletedModel.js";
import { Conversation, Message } from "../chat/models.js";
import { generateBookingCode } from "../../utils/bookingCode.js";
import generateBookingPDF from "../../utils/pdfGenerator.js";
import { sendEmail } from "../../utils/emailService.js";
import Review from "../reviews/model.js";

const router = Router();

router.get("/owner", async (req, res) => {
  connectDB();

  try {
    const { _id: id } = await JWTVerify(req);

    try {
      const bookingDocs = await Booking.find({ user: id }).populate("place");

      // Adiciona o campo 'hasReviewed' a cada reserva (para saber se o hóspede já avaliou)
      const bookingsWithReviewFlag = await Promise.all(
        bookingDocs.map(async (booking) => {
          const existingReview = await Review.findOne({
            booking: booking._id,
            reviewer: id,
            type: { $in: ["host", "experience"] }, // avaliação do anfitrião ou da experiência
          });
          return {
            ...booking.toObject(),
            hasReviewed: !!existingReview,
          };
        }),
      );

      res.json(bookingsWithReviewFlag);
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
  // ... (restante do código da rota POST mantém-se igual) ...
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

    // 2.5. Validar tipo de reserva (um dia vs vários dias)
    if (!placeDoc.isMultiDay) {
      if (checkin !== checkout) {
        return res.status(400).json({
          message:
            "Esta experiência só permite reserva de um dia por vez. As datas de check-in e check-out devem ser iguais.",
        });
      }
    }

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

    // 4.5. Calcular noites e total corretamente (ignorar dados do frontend)
    let calculatedNights;
    if (placeDoc.isMultiDay) {
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      calculatedNights = Math.max(1, diffDays);
    } else {
      calculatedNights = 1; // experiência de um dia tem 1 noite
    }
    const calculatedTotal = placeDoc.price * calculatedNights;

    const bookingCode = generateBookingCode();

    // 5. Criar a reserva
    const newBookingDoc = await Booking.create({
      place,
      user,
      price: placeDoc.price,
      total: calculatedTotal,
      checkin,
      checkout,
      guests,
      nights: calculatedNights,
      status: "confirmed",
      bookingCode,
    });

    // 6. Enviar mensagem automática de sistema (com código da reserva)
    try {
      const placeInfo = await Place.findById(place);
      if (placeInfo && placeInfo.owner) {
        const guestId = user;
        const hostId = placeInfo.owner;

        let conversation = await Conversation.findOne({
          participants: { $all: [guestId, hostId], $size: 2 },
          place: place,
        });

        if (!conversation) {
          console.log("Criando nova conversa entre", guestId, hostId);
          conversation = await Conversation.create({
            participants: [guestId, hostId],
            place: place,
          });
        }

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

    // 7. Enviar email com PDF de confirmação
    try {
      const guest = await User.findById(user);
      if (guest && guest.email) {
        const placeInfo = await Place.findById(place);
        const pdfBuffer = await generateBookingPDF(newBookingDoc, placeInfo);
        await sendEmail({
          to: guest.email,
          subject: `Confirmação de reserva - ${bookingCode}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Reserva confirmada!</h2>
              <p>Olá <strong>${guest.name}</strong>,</p>
              <p>A sua reserva para a experiência <strong>${placeInfo.title}</strong> foi confirmada.</p>
              <p>Em anexo está o comprovativo PDF com os detalhes e o código QR para o check‑in.</p>
              <p>Qualquer dúvida, contacte o anfitrião através do chat da plataforma.</p>
              <br/>
              <p>Equipa Viva Portugal</p>
            </div>
          `,
          attachments: [
            {
              filename: `reserva_${bookingCode}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      }
    } catch (emailError) {
      console.error("Erro ao enviar email com PDF:", emailError);
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

    const admin = req.user;

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

router.patch("/admin/:id/cancel", isSupportOrAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id).populate("place user");
    if (!booking) return res.status(404).json("Reserva não encontrada");
    booking.status = "cancelled";
    booking.cancelledBy = "admin";
    await booking.save();

    // Notificar no chat
    try {
      const conversation = await Conversation.findOne({
        participants: {
          $all: [booking.user._id, booking.place.owner],
          $size: 2,
        },
        place: booking.place._id,
      });
      if (conversation) {
        await Message.create({
          conversation: conversation._id,
          sender: null,
          text: `⚠️ A reserva para a experiência "${booking.place.title}" foi **cancelada pelo administrador**. Contacte o suporte para mais informações.`,
          isSystem: true,
          read: false,
        });
      }
    } catch (err) {
      console.error("Erro ao enviar notificação de cancelamento (admin):", err);
    }
    res.json({ message: "Reserva cancelada", status: booking.status });
  } catch (error) {
    console.error(error);
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
    // Se for reativada, removemos o cancelledBy (opcional)
    booking.cancelledBy = null;
    await booking.save();
    res.json({ message: "Reserva reativada", status: booking.status });
  } catch (error) {
    res.status(500).json("Erro ao reativar reserva");
  }
});

// ==================== CHECK-IN E CHECK-OUT ====================
router.patch("/:id/checkin", async (req, res) => {
  connectDB();
  const { id } = req.params;
  const { code } = req.body;
  try {
    const booking = await Booking.findById(id).populate("place");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Apenas reservas confirmadas podem fazer check-in" });
    }
    if (booking.bookingCode !== code) {
      return res.status(401).json({ message: "Código da reserva inválido" });
    }
    booking.status = "checked_in";
    await booking.save();
    res.json({ message: "Check-in efetuado com sucesso", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao fazer check-in" });
  }
});

router.patch("/:id/checkout", async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id).populate("place user");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });
    if (booking.status !== "checked_in") {
      return res.status(400).json({
        message: "Apenas reservas com check-in podem fazer check-out",
      });
    }
    booking.status = "completed";
    await booking.save();

    // Enviar lembrete para avaliar
    try {
      const conversation = await Conversation.findOne({
        participants: {
          $all: [booking.user._id, booking.place.owner],
          $size: 2,
        },
        place: booking.place._id,
      });
      if (conversation) {
        await Message.create({
          conversation: conversation._id,
          sender: null,
          text: `✅ A sua experiência "${booking.place.title}" foi concluída! Não se esqueça de avaliar o anfitrião e a experiência.`,
          isSystem: true,
          read: false,
        });
      }
      const guest = await User.findById(booking.user);
      await sendEmail({
        to: guest.email,
        subject: `Experiência concluída: ${booking.place.title}`,
        html: `<p>Olá ${guest.name}, a sua experiência foi concluída! Por favor, avalie o anfitrião e a experiência na sua área de reservas.</p>`,
      });
    } catch (err) {
      console.error("Erro ao enviar lembrete:", err);
    }

    res.json({
      message: "Check-out efetuado com sucesso. Avalie a experiência!",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao fazer check-out" });
  }
});

// ==================== ROTAS PARA O ANFITRIÃO (LISTAR RESERVAS DO SEU ANÚNCIO) ====================
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

    // Adiciona o campo 'guestReviewed' para cada reserva (indica se o anfitrião já avaliou o hóspede)
    const bookingsWithFlag = await Promise.all(
      bookings.map(async (booking) => {
        const existingReview = await Review.findOne({
          booking: booking._id,
          type: "guest",
        });
        return {
          ...booking.toObject(),
          guestReviewed: !!existingReview,
        };
      }),
    );

    res.json(bookingsWithFlag);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao buscar reservas");
  }
});

// ==================== CANCELAMENTO PELO ANFITRIÃO ====================
router.patch("/:id/cancel/owner", async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const { _id: userId } = await JWTVerify(req);
    const booking = await Booking.findById(id).populate("place user");
    if (!booking)
      return res.status(404).json({ message: "Reserva não encontrada" });
    if (booking.place.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Não autorizado" });
    }
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Apenas reservas confirmadas podem ser canceladas" });
    }
    booking.status = "cancelled";
    booking.cancelledBy = "host";
    await booking.save();

    // Notificar hóspede
    try {
      const conversation = await Conversation.findOne({
        participants: {
          $all: [booking.user._id, booking.place.owner],
          $size: 2,
        },
        place: booking.place._id,
      });
      if (conversation) {
        await Message.create({
          conversation: conversation._id,
          sender: null,
          text: `⚠️ A reserva para a experiência "${booking.place.title}" foi **cancelada pelo anfitrião**. Qualquer dúvida, responda a esta mensagem.`,
          isSystem: true,
          read: false,
        });
      }
      const guest = await User.findById(booking.user);
      await sendEmail({
        to: guest.email,
        subject: `Reserva cancelada pelo anfitrião`,
        html: `<p>Olá ${guest.name}, a sua reserva para a experiência "${booking.place.title}" foi cancelada pelo anfitrião.</p>`,
      });
    } catch (err) {
      console.error("Erro ao enviar notificação de cancelamento (host):", err);
    }

    res.json({ message: "Reserva cancelada com sucesso", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cancelar reserva" });
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

    const ownerUser = await User.findById(userId);
    const ownerName = ownerUser?.name || "Anunciante desconhecido";

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
