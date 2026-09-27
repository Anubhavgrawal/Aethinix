import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { validateDraw } from "../services/drawValidation.service";
import { getParam } from "../utils/params";

export const validateDrawController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);

    const draw = await prisma.draw.findUnique({
      where: {
        id: drawId,
      },
      include: {
        tournament: {
          select: {
            organizerId: true,
          },
        },
      },
    });

    if (!draw) {
      return res.status(404).json({
        message: "Draw not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      draw.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const result = await validateDraw(drawId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Draw validation error:", error);

    return res.status(500).json({
      message: "Failed to validate draw",
    });
  }
};