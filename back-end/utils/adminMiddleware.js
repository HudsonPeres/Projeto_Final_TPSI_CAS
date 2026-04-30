import { JWTVerify } from "./jwt.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await JWTVerify(req);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
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

export const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await JWTVerify(req);

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({
        message: "Acesso negado. Apenas superadministradores.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erro no middleware isSuperAdmin:", error);
    res.status(500).json({
      message: "Erro ao verificar permissões de superadmin",
    });
  }
};

export const isSupport = async (req, res, next) => {
  try {
    const user = await JWTVerify(req);
    if (
      !user ||
      (user.role !== "support" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res.status(403).json({
        message: "Acesso negado. Suporte ou administrador necessário.",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Middleware isSupport:", error);
    res
      .status(500)
      .json({ message: "Erro ao verificar permissões de suporte" });
  }
};

export const isSupportOrAdmin = async (req, res, next) => {
  try {
    const user = await JWTVerify(req);
    if (
      !user ||
      (user.role !== "support" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Acesso negado. Permissões insuficientes." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Erro no middleware isSupportOrAdmin:", error);
    res.status(500).json({ message: "Erro ao verificar permissões" });
  }
};
