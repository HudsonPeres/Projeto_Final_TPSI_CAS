import { Router } from "express";
import { connectDB } from "../../config/db.js";
import Demand from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";

const router = Router();

// GET /demands – listar demandas (apenas suporte, opcionalmente filtrar por status)
router.get("/", async (req, res) => {
  connectDB();
  const { status } = req.query; // 'open' ou 'resolved'
  try {
    const userInfo = await JWTVerify(req);
    if (!["support", "admin", "superadmin"].includes(userInfo.role)) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    const filter = status ? { status } : {};
    const demands = await Demand.find(filter).populate("user", "name email");
    res.json(demands);
  } catch (error) {
    res.status(500).json("Erro ao buscar demandas");
  }
});

// PUT /demands/:id/resolve – marcar demanda como resolvida
router.put("/:id/resolve", async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const userInfo = await JWTVerify(req);
    if (!["support", "admin", "superadmin"].includes(userInfo.role)) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    const demand = await Demand.findById(id);
    if (!demand) return res.status(404).json("Demanda não encontrada");
    demand.status = "resolved";
    demand.resolvedAt = new Date();
    demand.resolvedBy = userInfo._id;
    await demand.save();
    res.json(demand);
  } catch (error) {
    res.status(500).json("Erro ao resolver demanda");
  }
});

export default router;
