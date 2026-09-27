import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getParam } from "../utils/params";

export const getTournaments = async (_req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: {
        startDate: "asc",
      },
      include: {
        categories: true,
      },
    });

    res.json({
      success: true,
      data: tournaments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tournaments",
    });
  }
};

export const createTournament = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      slug,
      sport,
      venue,
      location,
      startDate,
      endDate,
      registrationOpen,
      registrationClose,
      description,
      rules,
      capacity,
      status,
    } = req.body;

    if (!name || !slug || !sport || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Name, slug, sport, startDate and endDate are required",
      });
    }

    const existingTournament = await prisma.tournament.findUnique({
      where: { slug },
    });

    if (existingTournament) {
      return res.status(409).json({
        success: false,
        message: "Tournament slug already exists",
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        slug,
        sport,
        organizerId: req.user!.userId,
        venue,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationOpen: registrationOpen
          ? new Date(registrationOpen)
          : null,
        registrationClose: registrationClose
          ? new Date(registrationClose)
          : null,
        description,
        rules,
        capacity: capacity ? Number(capacity) : null,
        status: status ?? "DRAFT",
      },
    });

    res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      data: tournament,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create tournament",
    });
  }
};

export const getTournamentBySlug = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = getParam(req.params.slug);

    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tournament",
    });
  }
};

export const publishTournament = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);

    const tournament = await prisma.tournament.findUnique({
      where: { id },
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

    if (tournament.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft tournaments can be published",
      });
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        status: "UPCOMING",
      },
    });

    return res.json({
      success: true,
      message: "Tournament published successfully",
      data: updatedTournament,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish tournament",
    });
  }
};

export const updateTournament = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);

    const {
      name,
      slug,
      sport,
      venue,
      location,
      startDate,
      endDate,
      registrationOpen,
      registrationClose,
      description,
      rules,
      capacity,
    } = req.body;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
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

    if (!name || !slug || !sport || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Name, slug, sport, startDate and endDate are required",
      });
    }

    const existingTournament = await prisma.tournament.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

    if (existingTournament) {
      return res.status(409).json({
        success: false,
        message: "Tournament slug already exists",
      });
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        name,
        slug,
        sport,
        venue,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationOpen: registrationOpen
          ? new Date(registrationOpen)
          : null,
        registrationClose: registrationClose
          ? new Date(registrationClose)
          : null,
        description,
        rules,
        capacity:
          capacity !== undefined && capacity !== ""
            ? Number(capacity)
            : null,
      },
    });

    return res.json({
      success: true,
      message: "Tournament updated successfully",
      data: updatedTournament,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tournament",
    });
  }
};