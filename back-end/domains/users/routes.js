import "dotenv/config";
import { Router } from "express";
import { connectDB } from "../../config/db.js";
import Users from "./model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTSign, JWTVerify } from "../../utils/jwt.js";
import { isSuperAdmin } from "../../utils/adminMiddleware.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();
const { JWT_SECRET_KEY } = process.env;

router.get("/", async (req, res) => {
  connectDB();

  try {
    const userDoc = await Users.find();
    res.json({ userDoc });
  } catch (error) {
    res.status(404).json(error);
  }
});

router.get("/profile", async (req, res) => {
  try {
    const userInfo = await JWTVerify(req);
    // Verifica se o token é válido
    if (!userInfo) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const user = await Users.findById(userInfo._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: "Erro ao buscar perfil" });
  }
});

router.put("/profile", async (req, res) => {
  connectDB();
  try {
    const userInfo = await JWTVerify(req);
    const { name, address, phone, phoneCode, birthDate } = req.body;
    const updatedUser = await Users.findByIdAndUpdate(
      userInfo._id,
      { name, address, phone, phoneCode, birthDate },
      { new: true },
    ).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});

router.post("/", async (req, res) => {
  connectDB();

  const { name, email, password } = req.body;
  const encryptedPassword = bcrypt.hashSync(password, bcryptSalt);

  try {
    const newUserDoc = await Users.create({
      name,
      email,
      password: encryptedPassword,
    });

    const { _id } = newUserDoc;
    const newUserObj = { name, email, _id, role: newUserDoc.role };
    try {
      const token = await JWTSign(newUserObj);

      res.cookie("token", token).json(newUserObj);
    } catch (error) {
      res.status(500).json("Erro ao assinar com o JWT", error);
    }
  } catch (error) {
    res.status(500).json(error);
    throw error;
  }
});

router.post("/login", async (req, res) => {
  connectDB();

  const { email, password } = req.body;

  try {
    const userDoc = await Users.findOne({ email });

    if (userDoc) {
      const passwordCorrect = bcrypt.compareSync(password, userDoc.password);
      const { name, _id } = userDoc;

      if (passwordCorrect) {
        const newUserObj = { name, email, _id, role: userDoc.role };
        try {
          const token = jwt.sign(newUserObj, JWT_SECRET_KEY);
          res.cookie("token", token).json(newUserObj);
        } catch (error) {
          console.error("Erro ao assinar JWT:", error);
          res.status(500).json({ message: "Erro ao assinar com o JWT", error });
        }
      } else {
        res.status(400).json("Senha inválida");
      }
    } else {
      res.status(404).json("Usuário não encontrado");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: error.message, error });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json("Sessão Encerrada com sucesso");
});

// SUPERADMIN
router.get("/all", isSuperAdmin, async (req, res) => {
  connectDB();
  try {
    const users = await Users.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json("Erro ao buscar usuários");
  }
});

router.put("/:id/role", isSuperAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  const { role } = req.body;
  if (!["user", "admin", "support", "superadmin"].includes(role)) {
    return res.status(400).json({ message: "Papel inválido" });
  }
  try {
    const user = await Users.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select("-password");
    if (!user) return res.status(404).json("Usuário não encontrado");
    res.json(user);
  } catch (error) {
    res.status(500).json("Erro ao atualizar papel");
  }
});

// RECUPERAÇÃO DE SENHA
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  res.json({
    message: "Se o email existir, enviaremos um código de recuperação.",
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;
  res.json({
    message: "Funcionalidade em desenvolvimento. Senha não alterada.",
  });
});

export default router;
