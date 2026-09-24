import { Router } from "express";

import {
  getServer,
  listServerChannels,
  listServers,
} from "../controllers/server.controller";

const router = Router();

router.get("/", listServers);
router.get("/:id", getServer);
router.get("/:id/channels", listServerChannels);

export default router;