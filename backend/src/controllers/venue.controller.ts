import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { getParam } from "../utils/params";

export const getTournamentVenues = async (
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
        message: "Not authorized",
      });
    }

    const venues = await prisma.venue.findMany({
      where: { tournamentId },
      include: {
        courts: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(venues);
  } catch (error) {
    console.error("Get tournament venues error:", error);

    return res.status(500).json({
      message: "Failed to fetch venues",
    });
  }
};

export const createVenue = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Venue name is required",
      });
    }

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
        message: "Not authorized",
      });
    }

    const venue = await prisma.venue.create({
      data: {
        tournamentId,
        name,
        address,
      },
    });

    return res.status(201).json({
      message: "Venue created successfully",
      venue,
    });
  } catch (error) {
    console.error("Create venue error:", error);

    return res.status(500).json({
      message: "Failed to create venue",
    });
  }
};