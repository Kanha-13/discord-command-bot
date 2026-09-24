import { Router } from "express";

import {
  getConfiguration,
  updateConfiguration,
} from "../controllers/configuration.controller";

const router = Router();

router.get("/:id/config", getConfiguration);
router.put("/:id/config", updateConfiguration);

export default router;