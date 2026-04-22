import "dotenv/config";
import { Router } from "express";
import { connectDB } from "../../config/db.js";
import Users from "./model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTSign, JWTVerify } from "../../utils/jwt.js";

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
  const userInfo = await JWTVerify(req);

  res.json(userInfo);
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

export default router;
