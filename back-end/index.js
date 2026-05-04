import "dotenv/config";
import express from "express";
import { app } from "./server.js";

const { PORT } = process.env;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`servidor está rodando na porta ${PORT}`);
});
