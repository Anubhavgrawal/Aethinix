import { prisma } from "../lib/prisma";
import { validateDraw } from "./drawValidation.service";

export const validateAndApproveDraw = async (
  drawId: string
) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  if (draw.status !== "DRAFT") {
    throw new Error(
      "Only a draft draw can be validated"
    );
  }

  await prisma.draw.update({
    where: {
      id: drawId,
    },
    data: {
      status: "VALIDATING",
    },
  });

  try {
    const validation = await validateDraw(drawId);

    if (!validation.valid) {
      await prisma.draw.update({
        where: {
          id: drawId,
        },
        data: {
          status: "DRAFT",
        },
      });

      return {
        approved: false,
        validation,
      };
    }

    const approvedDraw = await prisma.draw.update({
      where: {
        id: drawId,
      },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return {
      approved: true,
      validation,
      draw: approvedDraw,
    };
  } catch (error) {
    await prisma.draw.update({
      where: {
        id: drawId,
      },
      data: {
        status: "DRAFT",
      },
    });

    throw error;
  }
};

export const publishDraw = async (
  drawId: string
) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  if (draw.status !== "APPROVED") {
    throw new Error(
      "Only an approved draw can be published"
    );
  }

  return prisma.draw.update({
    where: {
      id: drawId,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};

export const lockDraw = async (
  drawId: string
) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  if (draw.status !== "PUBLISHED") {
    throw new Error(
      "Only a published draw can be locked"
    );
  }

  return prisma.draw.update({
    where: {
      id: drawId,
    },
    data: {
      status: "LOCKED",
      lockedAt: new Date(),
    },
  });
};