import { Router } from "express";
import {
  getConfiguration,
  updateConfiguration,
} from "../controllers/configuration.controller";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/:id/config", getConfiguration);
router.put("/:id/config", updateConfiguration);

export default router;