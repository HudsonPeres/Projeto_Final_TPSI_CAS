import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import router from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "node:path";

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  }),
);
app.use("/tmp", express.static(__dirname + "/tmp"));

app.use(router);
