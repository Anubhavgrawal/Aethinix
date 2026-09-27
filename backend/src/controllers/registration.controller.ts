import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getParam } from "../utils/params";

export const createRegistration = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("REGISTRATION BODY:", req.body);
    console.log("REGISTRATION USER:", req.user);
    const { tournamentId, categoryId } = req.body;

    if (!tournamentId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Tournament and category are required",
      });
    }

    // Only athletes can register
    if (req.user!.role !== "ATHLETE") {
      return res.status(403).json({
        success: false,
        message: "Only athletes can register for tournaments",
      });
    }

    // Find player's profile
    const player = await prisma.player.findUnique({
      where: {
        userId: req.user!.userId,
      },
    });

    console.log("FOUND PLAYER:", player);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player profile not found",
      });
    }

    console.log("PLAYER CHECK PASSED");
    console.log("STARTING TOURNAMENT LOOKUP");

    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
    });

    console.log("FOUND TOURNAMENT:", tournament);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Tournament must be upcoming
    if (tournament.status !== "UPCOMING") {
      return res.status(400).json({
        success: false,
        message: "Registration is not available for this tournament",
      });
    }

    // Check registration window
    const now = new Date();

    if (
      tournament.registrationOpen &&
      now < tournament.registrationOpen
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration has not opened yet",
      });
    }

    if (
      tournament.registrationClose &&
      now > tournament.registrationClose
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration has closed",
      });
    }

    // Get category
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Make sure category belongs to this tournament
    if (category.tournamentId !== tournamentId) {
      return res.status(400).json({
        success: false,
        message: "Category does not belong to this tournament",
      });
    }

    // Prevent duplicate registration
    const existingRegistration =
      await prisma.registration.findUnique({
        where: {
          playerId_tournamentId_categoryId: {
            playerId: player.id,
            tournamentId,
            categoryId,
          },
        },
      });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this category",
      });
    }

    // Generate registration ID
    const registrationId = `REG-${Date.now()}`;

    const registration = await prisma.registration.create({
      data: {
        registrationId,
        tournamentId,
        categoryId,
        playerId: player.id,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      data: registration,
    });
    } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
        return res.status(409).json({
        success: false,
        message:
            "You are already registered for this category",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Failed to create registration",
    });
    }
};

export const getMyRegistrations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user!.role !== "ATHLETE") {
      return res.status(403).json({
        success: false,
        message: "Only athletes can view their registrations",
      });
    }

    const player = await prisma.player.findUnique({
      where: {
        userId: req.user!.userId,
      },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player profile not found",
      });
    }

    const registrations = await prisma.registration.findMany({
      where: {
        playerId: player.id,
      },
      include: {
        tournament: {
          include: {
            categories: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
};

export const getTournamentRegistrations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
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
        message: "You are not authorized to view these registrations",
      });
    }

    const registrations = await prisma.registration.findMany({
      where: {
        tournamentId,
      },
      include: {
        player: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        category: true,
        tournament: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tournament registrations",
    });
  }
};

export const updateRegistrationStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration status",
      });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        id,
      },
      include: {
        tournament: true,
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (
      req.user!.role !== "SUPER_ADMIN" &&
      registration.tournament.organizerId !== req.user!.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this registration",
      });
    }

    if (registration.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending registrations can be updated",
      });
    }

    const updatedRegistration = await prisma.registration.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return res.json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully`,
      data: updatedRegistration,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update registration",
    });
  }
};

export const getTournamentPlayers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
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
        message: "You are not authorized to view these players",
      });
    }

    const players = await prisma.registration.findMany({
      where: {
        tournamentId,
        status: "APPROVED",
      },
      include: {
        player: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      success: true,
      data: players,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tournament players",
    });
  }
};

export const syncApprovedRegistrationsToEntries = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(
      req.params.tournamentId
    );

    const tournament =
      await prisma.tournament.findUnique({
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

    const approvedRegistrations =
      await prisma.registration.findMany({
        where: {
          tournamentId,
          status: "APPROVED",
        },
      });

    let created = 0;
    let skipped = 0;

    for (const registration of approvedRegistrations) {
      /*
       * Registration has categoryId, but TournamentEntry
       * does not store categoryId directly.
       *
       * The event belongs to the category, so we first
       * find the event for this registration's category.
       */
      const event = await prisma.event.findFirst({
        where: {
          categoryId: registration.categoryId,
          tournamentId,
        },
      });

      // Event configuration is required before an entry
      // can participate in the fixture engine.
      if (!event) {
        skipped++;
        continue;
      }

      const existingEntry =
        await prisma.tournamentEntry.findFirst({
          where: {
            tournamentId,
            eventId: event.id,
            playerId: registration.playerId,
          },
        });

      if (existingEntry) {
        skipped++;
        continue;
      }

      const player =
        await prisma.player.findUnique({
          where: {
            id: registration.playerId,
          },
        });

      if (!player) {
        skipped++;
        continue;
      }

      await prisma.tournamentEntry.create({
        data: {
          tournamentId,
          eventId: event.id,
          playerId: registration.playerId,
          rankingPoints: 0,
          seed: null,
        },
      });

      created++;
    }

    return res.status(200).json({
      message:
        "Approved registrations synced successfully",
      created,
      skipped,
      totalApproved:
        approvedRegistrations.length,
    });
  } catch (error) {
    console.error(
      "Sync approved registrations error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to sync approved registrations",
    });
  }
};