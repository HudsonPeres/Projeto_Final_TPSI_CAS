import { Router } from "express";
import { connectDB } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";
import { Conversation, Message } from "./models.js";

const router = Router();

const getUserId = async (req) => {
  const user = await JWTVerify(req);
  return user._id;
};

//  lista conversas do utilizador autenticado, com contagem de não lidas
router.get("/conversations", async (req, res) => {
  connectDB();
  try {
    const userId = await getUserId(req);
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name email")
      .populate("place", "title")
      .sort({ updatedAt: -1 });

    // Adicionar contagem de mensagens não lidas para cada conversa
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const other = conv.participants.find(
          (p) => p._id.toString() !== userId.toString(),
        );
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId }, // mensagens enviadas pelo outro utilizador
          read: false,
        });
        return {
          _id: conv._id,
          otherUser: other
            ? { _id: other._id, name: other.name, email: other.email }
            : null,
          place: conv.place,
          updatedAt: conv.updatedAt,
          unreadCount,
        };
      }),
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar conversas" });
  }
});

//obtém mensagens e marca como lidas
router.get("/conversations/:id/messages", async (req, res) => {
  connectDB();
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    const messages = await Message.find({ conversation: id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    // Marcar mensagens enviadas pelo outro utilizador como lidas
    await Message.updateMany(
      { conversation: id, sender: { $ne: userId }, read: false },
      { $set: { read: true } },
    );
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar mensagens" });
  }
});

//  enviar nova mensagem
router.post("/conversations/:id/messages", async (req, res) => {
  connectDB();
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Mensagem vazia" });
    }
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    const message = await Message.create({
      conversation: id,
      sender: userId,
      text: text.trim(),
      isSystem: false,
      read: false,
    });
    conversation.updatedAt = new Date();
    await conversation.save();
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email",
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao enviar mensagem" });
  }
});

// iniciar conversa
router.post("/conversations/start", async (req, res) => {
  connectDB();
  try {
    const userId = await getUserId(req);
    const { otherUserId, placeId } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId é obrigatório" });
    }

    let query = { participants: { $all: [userId, otherUserId], $size: 2 } };
    if (placeId) query.place = placeId;
    let conversation = await Conversation.findOne(query);
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
        place: placeId || null,
      });
    }
    res.status(201).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao iniciar conversa" });
  }
});

export default router;
