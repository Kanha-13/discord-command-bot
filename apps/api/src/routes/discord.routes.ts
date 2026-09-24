import { Router } from "express";
import { handleDiscordInteraction } from "../controllers/discord-interaction.controller";
import { verifyDiscordSignature } from "../middleware/verify-discord-signature";

const router = Router();

router.post(
  "/interactions",
  verifyDiscordSignature,
  handleDiscordInteraction,
);

export default router;