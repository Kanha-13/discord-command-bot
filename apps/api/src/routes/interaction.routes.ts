import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();

router.use(requireAuth, requireAdmin);

export default router;