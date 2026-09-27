import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { generateTimeSlots } from "../services/scheduling.service";
import { assignMatchesToSlots } from "../services/matchAssignment.service";
import { getParam } from "../utils/params";

export const generateScheduleSlots = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const {
      date,
      startTime,
      endTime,
    } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        message:
          "Date, start time and end time are required",
      });
    }

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      select: {
        id: true,
        organizerId: true,
      },
    });

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const result = await generateTimeSlots(
      tournamentId,
      {
        date: new Date(date),
        startTime,
        endTime,
      }
    );

    return res.status(201).json(result);
  } catch (error) {
    console.error(
      "Generate schedule slots error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate schedule slots";

    return res.status(400).json({
      message,
    });
  }
};

export const assignDrawMatches = async (
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

    const result = await assignMatchesToSlots(
      drawId
    );

    return res.status(200).json({
      message:
        "Matches scheduled successfully",
      result,
    });
  } catch (error) {
    console.error(
      "Assign draw matches error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to schedule matches";

    return res.status(400).json({
      message,
    });
  }
};