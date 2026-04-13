import "dotenv/config";
import mongoose from "mongoose";

const { MONGO_URL } = process.env;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado com sucesso");
  } catch (error) {
    console.log("Não foi possível conectar~com o banco de dados");
  }
};
