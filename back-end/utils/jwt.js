import "dotenv/config";
import jwt from "jsonwebtoken";

const { JWT_SECRET_KEY } = process.env;

/**
 * Verifica o token JWT.
 * Procura o token primeiro no cookie (web) e, caso não exista,
 * no header Authorization: Bearer <token> (mobile).
 *
 * @param {Request} req - Objecto do pedido Express
 * @returns {Promise<Object>} - Payload descodificado (ex: { _id, name, email, role })
 * @throws {Error} - Se o token estiver em falta ou for inválido
 */
export const JWTVerify = (req) => {
  return new Promise((resolve, reject) => {
    let token = req.cookies?.token;

    // Se não houver cookie, procura no header Authorization (mobile)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    // Se mesmo assim não houver token, rejeita
    if (!token) {
      return reject(new Error("Token não encontrado"));
    }

    jwt.verify(token, JWT_SECRET_KEY, {}, (error, userInfo) => {
      if (error) {
        console.error("Erro ao verificar com o JWT:", error);
        reject(error);
      } else {
        resolve(userInfo);
      }
    });
  });
};

export const JWTSign = (newUserObj) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      newUserObj,
      JWT_SECRET_KEY,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          console.error("Erro ao assinar com o JWT:", error);
          reject(error);
        }
        resolve(token);
      },
    );
  });
};
