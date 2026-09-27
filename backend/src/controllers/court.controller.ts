import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { getParam } from "../utils/params";

export const getVenueCourts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const venueId = getParam(req.params.venueId);

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        tournament: {
          select: {
            organizerId: true,
          },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        message: "Venue not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      venue.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const courts = await prisma.court.findMany({
      where: {
        venueId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(courts);
  } catch (error) {
    console.error("Get venue courts error:", error);

    return res.status(500).json({
      message: "Failed to fetch courts",
    });
  }
};

export const createCourt = async (
  req: AuthRequest,
  res: Response
) => {  
  try {
    const venueId = getParam(req.params.venueId);
    const { name, courtNumber, type } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Court name is required",
      });
    }

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        tournament: {
          select: {
            organizerId: true,
          },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        message: "Venue not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      venue.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const court = await prisma.court.create({
      data: {
        venueId,
        name,
        number: courtNumber,
      },
    });

    return res.status(201).json({
      message: "Court created successfully",
      court,
    });
  } catch (error) {
    console.error("Create court error:", error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create court",
    });
  }
};

export const updateCourt = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);
    const { name, courtNumber, type, isActive } = req.body;

    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            tournament: {
              select: {
                organizerId: true,
              },
            },
          },
        },
      },
    });

    if (!court) {
      return res.status(404).json({
        message: "Court not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      court.venue.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const updatedCourt = await prisma.court.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(courtNumber !== undefined && { number: courtNumber }),
        ...(isActive !== undefined && { active: isActive }),
      },
    });

    return res.status(200).json({
      message: "Court updated successfully",
      court: updatedCourt,
    });
  } catch (error) {
    console.error("Update court error:", error);

    return res.status(500).json({
      message: "Failed to update court",
    });
  }
};