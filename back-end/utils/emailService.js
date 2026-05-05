import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // ✅ Força o uso exclusivo de IPv4 (resolve problemas no Render)
});

/**
 * Envia um email com token OTP (texto simples)
 * @param {string} to - email de destino
 * @param {string} type - tipo de token (register, login, change_email, change_password, reset_password)
 * @param {string} token - código numérico (ex: "123456")
 * @returns {Promise<void>}
 */
export const sendTokenEmail = async (to, type, token) => {
  let subject = "";
  let text = "";

  switch (type) {
    case "register":
      subject = "Bem-vindo! Confirme o seu registo";
      text = `O seu código de verificação para concluir o registo é: ${token}. Válido por 10 minutos.`;
      break;
    case "login":
      subject = "Seu código de acesso";
      text = `Utilize o código ${token} para concluir o seu login. Válido por 10 minutos.`;
      break;
    case "change_email":
      subject = "Alteração de email";
      text = `O código para alterar o seu email é: ${token}. Válido por 10 minutos.`;
      break;
    case "change_password":
      subject = "Alteração de palavra-passe";
      text = `O código para redefinir a sua palavra-passe é: ${token}. Válido por 10 minutos.`;
      break;
    case "reset_password":
      subject = "Recuperação de palavra-passe";
      text = `O código para redefinir a sua palavra-passe é: ${token}. Válido por 10 minutos.`;
      break;
    default:
      subject = "Código de verificação";
      text = `O seu código é: ${token}. Válido por 10 minutos.`;
  }

  const mailOptions = {
    from: `"Viva Portugal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Envia um email com suporte a HTML e anexos
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {Array} [options.attachments]
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html, attachments }) => {
  const mailOptions = {
    from: `"Viva Portugal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: attachments || [],
  };

  await transporter.sendMail(mailOptions);
};
