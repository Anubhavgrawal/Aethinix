import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getParam } from "../utils/params";

export const generateFixtures = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { tournamentId, categoryId } = req.body;

    if (!tournamentId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Tournament ID and Category ID are required",
      });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    if (
      req.user!.role !== "SUPER_ADMIN" &&
      tournament.organizerId !== req.user!.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this tournament",
      });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        tournamentId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found in this tournament",
      });
    }

    const existingFixtures = await prisma.fixture.count({
      where: {
        tournamentId,
        categoryId,
      },
    });

    if (existingFixtures > 0) {
      return res.status(400).json({
        success: false,
        message: "Fixtures have already been generated for this category",
      });
    }

    const approvedRegistrations =
      await prisma.registration.findMany({
        where: {
          tournamentId,
          categoryId,
          status: "APPROVED",
        },
        include: {
          player: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (approvedRegistrations.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 approved players are required",
      });
    }

    const fixtures = [];

    for (let i = 0; i < approvedRegistrations.length; i += 2) {
      const player1 = approvedRegistrations[i];
      const player2 = approvedRegistrations[i + 1];

      const fixture = await prisma.fixture.create({
        data: {
          tournamentId,
          categoryId,
          round: "ROUND 1",
          matchNumber: i / 2 + 1,
          player1Id: player1.playerId,
          player2Id: player2?.playerId ?? null,
          status: player2
            ? "SCHEDULED"
            : "WALKOVER",
          winnerId: player2
            ? null
            : player1.playerId,
        },
        include: {
          player1: {
            include: {
              user: true,
            },
          },
          player2: {
            include: {
              user: true,
            },
          },
          winner: {
            include: {
              user: true,
            },
          },
          category: true,
        },
      });

      fixtures.push(fixture);
    }

    return res.status(201).json({
      success: true,
      message: "Fixtures generated successfully",
      data: fixtures,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate fixtures",
    });
  }
};

export const getTournamentFixtures = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const fixtures = await prisma.fixture.findMany({
      where: {
        tournamentId,
      },
      include: {
        category: true,
        player1: {
          include: {
            user: true,
          },
        },
        player2: {
          include: {
            user: true,
          },
        },
        winner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        {
          categoryId: "asc",
        },
        {
          matchNumber: "asc",
        },
      ],
    });

    return res.json({
      success: true,
      data: fixtures,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fixtures",
    });
  }
};

export const updateFixtureResult = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);
    const { winnerId, score, status } = req.body;

    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: {
        tournament: true,
      },
    });

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: "Fixture not found",
      });
    }

    if (
      req.user!.role !== "SUPER_ADMIN" &&
      fixture.tournament.organizerId !== req.user!.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this fixture",
      });
    }

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        message: "Winner is required",
      });
    }

    if (
      winnerId !== fixture.player1Id &&
      winnerId !== fixture.player2Id
    ) {
      return res.status(400).json({
        success: false,
        message: "Winner must be one of the players",
      });
    }

    if (fixture.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Result has already been submitted",
      });
    }

    const updatedFixture = await prisma.fixture.update({
      where: { id },
      data: {
        winnerId,
        score: score || null,
        status: status || "COMPLETED",
      },
      include: {
        category: true,
        player1: {
          include: {
            user: true,
          },
        },
        player2: {
          include: {
            user: true,
          },
        },
        winner: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Fixture result updated successfully",
      data: updatedFixture,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update fixture result",
    });
  }
};