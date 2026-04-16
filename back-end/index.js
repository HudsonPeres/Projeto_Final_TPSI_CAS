import "dotenv/config";
import express from "express";
import UserRoutes from "./domains/users/routes.js";
import PlaceRoutes from "./domains/places/routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const { PORT } = process.env;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/users", UserRoutes);
app.use("/places", PlaceRoutes);

app.listen(PORT, () => {
  console.log(`servidor está rodando na porta ${PORT}`);
});
