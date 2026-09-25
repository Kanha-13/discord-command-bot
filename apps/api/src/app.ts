import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import discordRouter from "./routes/discord.routes"
import serverRouter from "./routes/server.routes"
import configurationRouter from "./routes/configuration.routes"
import authRouter from "./routes/auth.routes"
import interactionRouter from "./routes/interaction.routes"

const app = express();

app.use(
  cors({
    origin: process.env.WEB_APP_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  "/api/discord/interactions",
  express.raw({
    type: "application/json",
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp());

app.use("/api/discord", discordRouter);
app.use("/api/servers", serverRouter);
app.use("/api/servers", configurationRouter);
app.use("/api/auth", authRouter);
app.use("/api/interactions", interactionRouter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "discord-command-bot-api",
  });
});

export default app;