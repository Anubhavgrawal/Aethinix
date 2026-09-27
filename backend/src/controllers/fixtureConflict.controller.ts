import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import {
  getMatchConflicts,
  getTournamentConflicts,
  resolveFixtureConflict,
} from "../services/fixtureConflict.service";
import { getParam } from "../utils/params";

const checkTournamentAccess = async (
  req: AuthRequest,
  tournamentId: string
) => {
  if (req.user?.role === "SUPER_ADMIN") {
    return true;
  }

  if (req.user?.role !== "ORGANIZER") {
    return false;
  }

  const tournament =
    await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      select: {
        organizerId: true,
      },
    });

  if (!tournament) {
    return false;
  }

  return tournament.organizerId === req.user.userId;
};

export const getMatchFixtureConflicts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const matchId = getParam(req.params.matchId);

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      select: {
        tournamentId: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const hasAccess = await checkTournamentAccess(
      req,
      match.tournamentId
    );

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "You are not authorized to access this match",
      });
    }

    const conflicts =
      await getMatchConflicts(matchId);

    return res.status(200).json({
      conflicts,
    });
  } catch (error) {
    console.error(
      "Get match conflicts error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get match conflicts";

    return res.status(400).json({
      message,
    });
  }
};

export const getTournamentFixtureConflicts =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const tournamentId = getParam(req.params.tournamentId);

      const hasAccess =
        await checkTournamentAccess(
          req,
          tournamentId
        );

      if (!hasAccess) {
        return res.status(403).json({
          message:
            "You are not authorized to access this tournament",
        });
      }

      const conflicts =
        await getTournamentConflicts(
          tournamentId
        );

      return res.status(200).json({
        conflicts,
      });
    } catch (error) {
      console.error(
        "Get tournament conflicts error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to get tournament conflicts";

      return res.status(400).json({
        message,
      });
    }
  };

export const resolveConflict = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const conflictId = getParam(req.params.conflictId);

    const existingConflict =
      await prisma.fixtureConflict.findUnique({
        where: {
          id: conflictId,
        },
        select: {
          tournamentId: true,
        },
      });

    if (!existingConflict) {
      return res.status(404).json({
        message: "Fixture conflict not found",
      });
    }

    const hasAccess =
      await checkTournamentAccess(
        req,
        existingConflict.tournamentId
      );

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "You are not authorized to resolve this conflict",
      });
    }

    const conflict =
      await resolveFixtureConflict(
        conflictId
      );

    return res.status(200).json({
      message: "Fixture conflict resolved",
      conflict,
    });
  } catch (error) {
    console.error(
      "Resolve conflict error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to resolve fixture conflict";

    return res.status(400).json({
      message,
    });
  }
};