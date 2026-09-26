import { Router } from "express";
import {
  getInteraction,
  listInteractions,
} from "../controllers/interaction.controller";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listInteractions);
router.get("/:id", getInteraction);

export default router;