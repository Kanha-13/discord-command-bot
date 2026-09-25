import { Router } from "express";
import {
  discordCallback,
  getCurrentUser,
  logout,
  redirectToDiscord,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.get("/discord", redirectToDiscord);
router.get("/discord/callback", discordCallback);
router.get("/me",requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;