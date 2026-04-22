import { JWTVerify } from "./jwt.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await JWTVerify(req);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acesso negado. Apenas administradores." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Erro no middleware isAdmin:", error);
    res.status(500).json({ message: "Erro ao verificar permissões" });
  }
};
