import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: "ATHLETE",
        },
      });

      const sequenceResult = await tx.$queryRaw<
        { nextval: bigint }[]
      >`SELECT nextval('player_id_seq')`;

      const playerNumber = Number(sequenceResult[0].nextval);

      const playerId = `AX-${String(playerNumber).padStart(5, "0")}`;

      const player = await tx.player.create({
        data: {
          userId: user.id,
          playerId,
        },
      });

      return { user, player };
    });

    res.status(201).json({
      success: true,
      message: "User and Player created successfully",
      data: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        status: result.user.status,
        playerId: result.player.playerId,
        createdAt: result.user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        player: {
          select: {
            id: true,
            playerId: true,
            sport: true,
            gender: true,
            academy: true,
            coach: true,
            profilePhoto: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


export const createOrganizer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const organizer = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "ORGANIZER",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Organizer created successfully",
      data: {
        id: organizer.id,
        name: organizer.name,
        email: organizer.email,
        phone: organizer.phone,
        role: organizer.role,
        status: organizer.status,
        createdAt: organizer.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create organizer",
    });
  }
};
