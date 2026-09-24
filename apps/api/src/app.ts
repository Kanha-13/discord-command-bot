import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";

const app = express();

app.use(
  cors({
    origin: process.env.WEB_APP_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(pinoHttp());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "discord-command-bot-api",
  });
});

export default app;