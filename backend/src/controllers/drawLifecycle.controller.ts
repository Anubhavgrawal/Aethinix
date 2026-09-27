import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import {
  validateAndApproveDraw,
  publishDraw,
  lockDraw,
} from "../services/drawLifecycle.service";
import { getParam } from "../utils/params";

const checkDrawOwnership = async (
  drawId: string,
  req: AuthRequest
) => {
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
    throw new Error("Draw not found");
  }

  if (
    req.user?.role !== "SUPER_ADMIN" &&
    draw.tournament.organizerId !== req.user?.userId
  ) {
    throw new Error("Not authorized");
  }

  return draw;
};

export const approveDraw = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);

    await checkDrawOwnership(drawId, req);

    const result =
      await validateAndApproveDraw(drawId);

    if (!result.approved) {
      return res.status(400).json({
        message:
          "Draw validation failed. Approval blocked.",
        ...result,
      });
    }

    return res.status(200).json({
      message:
        "Draw validated and approved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Approve draw error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to approve draw";

    return res.status(400).json({
      message,
    });
  }
};

export const publishDrawController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);

    await checkDrawOwnership(drawId, req);

    const draw = await publishDraw(drawId);

    return res.status(200).json({
      message: "Draw published successfully",
      draw,
    });
  } catch (error) {
    console.error("Publish draw error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to publish draw";

    return res.status(400).json({
      message,
    });
  }
};

export const lockDrawController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);

    await checkDrawOwnership(drawId, req);

    const draw = await lockDraw(drawId);

    return res.status(200).json({
      message: "Draw locked successfully",
      draw,
    });
  } catch (error) {
    console.error("Lock draw error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to lock draw";

    return res.status(400).json({
      message,
    });
  }
};