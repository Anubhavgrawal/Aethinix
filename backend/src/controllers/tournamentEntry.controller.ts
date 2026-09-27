import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { getParam } from "../utils/params";

export const getTournamentEntries = async (
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

    const entries = await prisma.tournamentEntry.findMany({
      where: {
        tournamentId,
      },
      include: {
        player: true,
        event: true,
        pair: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(entries);
  } catch (error) {
    console.error("Get tournament entries error:", error);

    return res.status(500).json({
      message: "Failed to fetch tournament entries",
    });
  }
};

export const createTournamentEntry = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const {
      playerId,
      categoryId,
      eventId,
      seed,
      rankingPoints,
    } = req.body;

    if (!playerId || !categoryId || !eventId) {
      return res.status(400).json({
        message: "Player, category and event are required",
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

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        tournamentId,
      },
    });

    if (!category) {
      return res.status(400).json({
        message: "Category does not belong to this tournament",
      });
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        categoryId,
        tournamentId,
      },
    });

    if (!event) {
      return res.status(400).json({
        message: "Event does not belong to this category/tournament",
      });
    }

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    const existingEntry = await prisma.tournamentEntry.findFirst({
      where: {
        tournamentId,
        categoryId,
        eventId,
        playerId,
      },
    });

    if (existingEntry) {
      return res.status(409).json({
        message: "Player is already entered in this event",
      });
    }

    const entry = await prisma.tournamentEntry.create({
      data: {
        tournamentId,
        categoryId,
        eventId,
        playerId,
        seed: seed ?? null,
        rankingPoints: rankingPoints ?? 0,
      },
      include: {
        player: true,
        category: true,
        event: true,
      },
    });

    return res.status(201).json({
      message: "Tournament entry created successfully",
      entry,
    });
  } catch (error) {
    console.error("Create tournament entry error:", error);

    return res.status(500).json({
      message: "Failed to create tournament entry",
    });
  }
};