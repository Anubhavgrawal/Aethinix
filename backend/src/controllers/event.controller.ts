import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { getParam } from "../utils/params";

export const getCategoryEvents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const categoryId = getParam(req.params.categoryId);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        tournament: {
          select: {
            organizerId: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      category.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const events = await prisma.event.findMany({
      where: {
        categoryId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Get category events error:", error);

    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const categoryId = getParam(req.params.categoryId);
    const { name, code, eventType } = req.body;

    if (!name || !code || !eventType) {
      return res.status(400).json({
        message: "Name, code and event type are required",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        tournament: {
          select: {
            id: true,
            organizerId: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      category.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        categoryId,
        code,
      },
    });

    if (existingEvent) {
      return res.status(409).json({
        message: "Event with this code already exists in this category",
      });
    }

    const event = await prisma.event.create({
      data: {
        tournamentId: category.tournament.id,
        categoryId,
        name,
        code,
        eventType,
      },
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: "Failed to create event",
    });
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);
    const { name, code, eventType } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            organizerId: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      req.user?.role !== "SUPER_ADMIN" &&
      event.tournament.organizerId !== req.user?.userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(eventType !== undefined && { eventType }),
      },
    });

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      message: "Failed to update event",
    });
  }
};