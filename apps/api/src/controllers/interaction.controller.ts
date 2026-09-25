import type { Request, Response } from "express";
import {
  getInteractionById,
  getInteractions,
} from "../services/interaction.service";
import { interactionQuerySchema } from "../utils/validation";

export async function listInteractions(
  req: Request,
  res: Response,
) {
  const result = interactionQuerySchema.safeParse(
    req.query,
  );

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid interaction query parameters.",
      },
    });
  }

  const data = await getInteractions(result.data);

  return res.json({
    data,
  });
}

interface IdParams {
  id: string;
}


export async function getInteraction(
  req: Request<IdParams>,
  res: Response,
) {
  const interaction = await getInteractionById(
    req.params.id,
  );

  if (!interaction) {
    return res.status(404).json({
      error: {
        code: "INTERACTION_NOT_FOUND",
        message: "Interaction was not found.",
      },
    });
  }

  return res.json({
    data: interaction,
  });
}