import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config/db.js";
import Users from "../users/model.js";
import Token from "../tokens/model.js";
import { generateOTP } from "../../utils/otp.js";
import { sendTokenEmail } from "../../utils/emailService.js";
import { validatePassword } from "../../utils/passwordValidator.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();
const { JWT_SECRET_KEY } = process.env;

router.post("/request-otp", async (req, res) => {
  connectDB();
  const { email, type } = req.body;

  if (!email || !type) {
    return res.status(400).json({ message: "Email e tipo são obrigatórios" });
  }

  if (type === "register") {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email já registado. Faça login." });
    }
  }

  if (type === "login") {
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Utilizador não encontrado. Registe-se primeiro." });
    }
  }

  // Gerar OTP e guardar na BD
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await Token.deleteMany({ email, type, used: false });

  await Token.create({
    email,
    token: otp,
    type,
    expiresAt,
    used: false,
  });

  // Enviar email
  await sendTokenEmail(email, type, otp);

  res.json({ message: `Código enviado para ${email}. Válido por 10 minutos.` });
});

router.post("/verify-otp", async (req, res) => {
  connectDB();
  const { email, otp, type, password, name } = req.body;

  if (!email || !otp || !type) {
    return res
      .status(400)
      .json({ message: "Email, OTP e tipo são obrigatórios" });
  }

  // Buscar token válido
  const tokenDoc = await Token.findOne({
    email,
    token: otp,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return res
      .status(400)
      .json({ message: "Código inválido ou expirado. Solicite um novo." });
  }

  tokenDoc.used = true;
  await tokenDoc.save();

  if (type === "register") {
    if (!name || !password) {
      return res
        .status(400)
        .json({ message: "Nome e password são obrigatórios para registo" });
    }

    const { isValid, message } = validatePassword(password);
    if (!isValid) {
      return res.status(400).json({ message });
    }

    const encryptedPassword = bcrypt.hashSync(password, bcryptSalt);

    const newUser = await Users.create({
      name,
      email,
      password: encryptedPassword,
      role: "user",
    });
    const { _id, role } = newUser;
    const token = jwt.sign({ name, email, _id, role }, JWT_SECRET_KEY);
    res.cookie("token", token).json({ name, email, _id, role });
  }

  if (type === "login") {
    if (!password) {
      return res.status(400).json({ message: "Password é obrigatória" });
    }
    const user = await Users.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    const passwordCorrect = bcrypt.compareSync(password, user.password);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Palavra-passe incorreta" });
    }

    const { name, _id, role } = user;
    const token = jwt.sign({ name, email, _id, role }, JWT_SECRET_KEY);
    res.cookie("token", token).json({ name, email, _id, role });
  }
});

router.post("/forgot-password", async (req, res) => {
  connectDB();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  const user = await Users.findOne({ email });
  if (!user) {
    // Por segurança, retornamos a mesma mensagem mesmo que o email não exista
    return res.status(404).json({
      message: "Se o email existir, enviaremos um código de recuperação.",
    });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await Token.deleteMany({ email, type: "reset_password", used: false });

  await Token.create({
    email,
    token: otp,
    type: "reset_password",
    expiresAt,
    used: false,
  });

  await sendTokenEmail(email, "reset_password", otp);

  res.json({ message: "Código enviado para o email. Válido por 10 minutos." });
});

router.post("/reset-password", async (req, res) => {
  connectDB();
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, código e nova senha são obrigatórios." });
  }

  const tokenDoc = await Token.findOne({
    email,
    token: otp,
    type: "reset_password",
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return res
      .status(400)
      .json({ message: "Código inválido ou expirado. Solicite um novo." });
  }

  tokenDoc.used = true;
  await tokenDoc.save();

  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Utilizador não encontrado." });
  }

  const bcryptSalt = bcrypt.genSaltSync();
  const { isValid, message } = validatePassword(newPassword);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const encryptedPassword = bcrypt.hashSync(newPassword, bcryptSalt);
  user.password = encryptedPassword;
  await user.save();

  res.json({
    message: "Palavra-passe alterada com sucesso. Já pode fazer login.",
  });
});

export default router;
