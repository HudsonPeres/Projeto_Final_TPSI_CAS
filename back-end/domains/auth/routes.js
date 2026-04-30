import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config/db.js";
import Users from "../users/model.js";
import Token from "../tokens/model.js";
import { generateOTP } from "../../utils/otp.js";
import { sendTokenEmail } from "../../utils/emailService.js";
import { validatePassword } from "../../utils/passwordValidator.js";
import { JWTVerify } from "../../utils/jwt.js";
import passport from "./google.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();
const { JWT_SECRET_KEY } = process.env;

router.post("/request-otp", async (req, res) => {
  connectDB();
  const { email, type, password } = req.body;

  if (!email || !type) {
    return res.status(400).json({ message: "Email e tipo são obrigatórios" });
  }

  if (type === "change_email" || type === "change_password") {
    let userInfo;
    try {
      userInfo = await JWTVerify(req);
    } catch (err) {
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }

    if (email !== userInfo.email) {
      return res.status(403).json({
        message: "Email não corresponde ao utilizador autenticado.",
      });
    }
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
    if (!password) {
      return res.status(400).json({ message: "Password é obrigatória" });
    }
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    const passwordCorrect = bcrypt.compareSync(password, user.password);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Senha incorreta" });
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
  const { email, otp, type, name, password, newPassword, newEmail } = req.body;

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

  if (type === "change_password") {
    if (!newPassword)
      return res
        .status(400)
        .json({ message: "Nova palavra-passe obrigatória." });

    const { isValid, message } = validatePassword(newPassword);
    if (!isValid) return res.status(400).json({ message });

    const user = await Users.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado." });

    const bcryptSalt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(newPassword, bcryptSalt);
    await user.save();

    return res.json({ message: "Palavra-passe alterada com sucesso." });
  }

  if (type === "change_email") {
    if (!newEmail)
      return res.status(400).json({ message: "Novo email obrigatório." });
    // Verificar se novo email já existe
    const existing = await Users.findOne({ email: newEmail });
    if (existing)
      return res.status(409).json({ message: "Este email já está registado." });

    const user = await Users.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado." });

    user.email = newEmail;
    await user.save();

    const token = jwt.sign(
      { name: user.name, email: user.email, _id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
    );
    res.cookie("token", token).json({ message: "Email alterado com sucesso." });
  }

  // ========== REGISTO (com token no corpo) ==========
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
    // ---- ALTERAÇÃO: adicionamos "token" no objeto JSON ----
    res.cookie("token", token).json({ name, email, _id, role, token });
  }

  // ========== LOGIN (com token no corpo) ==========
  if (type === "login") {
    // A senha já foi validada no request-otp, não precisa verificar novamente
    const user = await Users.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    const { name, _id, role } = user;
    const token = jwt.sign({ name, email, _id, role }, JWT_SECRET_KEY);
    // ---- ALTERAÇÃO: adicionamos "token" no objeto JSON ----
    res.cookie("token", token).json({ name, email, _id, role, token });
  }
});

// ========== NOVA ROTA: obter perfil do utilizador autenticado ==========
router.get("/me", async (req, res) => {
  try {
    const user = await JWTVerify(req);
    // Retorna o payload descodificado: { _id, name, email, role }
    res.json(user);
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
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

// ==================== ROTAS GOOGLE ====================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const { _id, name, email, role } = req.user;
      const token = jwt.sign(
        { _id, name, email, role },
        process.env.JWT_SECRET_KEY,
      );
      res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(frontendUrl);
    } catch (error) {
      console.error("Erro no callback Google:", error);
      res.redirect("/login");
    }
  },
);

export default router;
