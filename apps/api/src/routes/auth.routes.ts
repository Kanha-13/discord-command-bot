import { Router } from "express";
import {
  discordCallback,
  getCurrentUser,
  logout,
  redirectToDiscord,
} from "../controllers/auth.controller";

const router = Router();

router.get("/discord", redirectToDiscord);
router.get("/discord/callback", discordCallback);
router.get("/me", getCurrentUser);
router.post("/logout", logout);

export default router;