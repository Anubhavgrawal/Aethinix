import { Request, Response } from "express";
import { getParam } from "../utils/params";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getTournamentRule = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
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
        message: "Not authorized to access this tournament",
      });
    }

    const rule = await prisma.tournamentRule.findUnique({
      where: { tournamentId },
    });

    return res.status(200).json(rule);
  } catch (error) {
    console.error("Get tournament rule error:", error);

    return res.status(500).json({
      message: "Failed to fetch tournament rules",
    });
  }
};

export const upsertTournamentRule = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
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
        message: "Not authorized to modify this tournament",
      });
    }

    const {
    format,
    matchDurationMin,
    courtTurnaroundMin,
    operationalBufferMin,
    minimumRestMin,
    operatingStartTime,
    operatingEndTime,
    randomizeUnseeded,
    protectFinal,
    } = req.body;

    const rule = await prisma.tournamentRule.upsert({
      where: {
        tournamentId,
      },
      create: {
        tournamentId,
        format,
        matchDurationMin,
        courtTurnaroundMin,
        operationalBufferMin,
        minimumRestMin,
        operatingStartTime,
        operatingEndTime,
        randomizeUnseeded,
        protectFinal,
        },
      update: {
        format,
        matchDurationMin,
        courtTurnaroundMin,
        operationalBufferMin,
        minimumRestMin,
        operatingStartTime,
        operatingEndTime,
        randomizeUnseeded,
        protectFinal,
        },
    });

    return res.status(200).json({
      message: "Tournament rules saved successfully",
      rule,
    });
  } catch (error) {
    console.error("Upsert tournament rule error:", error);

    return res.status(500).json({
      message: "Failed to save tournament rules",
    });
  }
};