import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getParam } from "../utils/params";

export const getCategories = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);

    const categories = await prisma.category.findMany({
      where: { tournamentId },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);
    const {
      name,
      gender,
      ageGroup,
      eligibility,
      capacity,
      fee,
    } = req.body;

    if (!name || fee === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category name and fee are required",
      });
    }

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

    // Organizer can only modify their own tournament.
    // SUPER_ADMIN can manage any tournament.
    if (
      req.user!.role !== "SUPER_ADMIN" &&
      tournament.organizerId !== req.user!.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this tournament",
      });
    }

    const category = await prisma.category.create({
      data: {
        tournamentId,
        name,
        gender,
        ageGroup,
        eligibility,
        capacity: capacity ? Number(capacity) : null,
        fee: Number(fee),
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};