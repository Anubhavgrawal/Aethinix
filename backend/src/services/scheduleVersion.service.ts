import { prisma } from "../lib/prisma";

export const createScheduleVersion = async (
  drawId: string,
  createdBy: string,
  changeReason?: string
) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  const latestVersion =
    await prisma.scheduleVersion.findFirst({
      where: {
        drawId,
      },
      orderBy: {
        version: "desc",
      },
    });

  const nextVersion =
    latestVersion
      ? latestVersion.version + 1
      : 1;

  const scheduleVersion =
    await prisma.scheduleVersion.create({
      data: {
        tournamentId: draw.tournamentId,
        drawId: draw.id,
        version: nextVersion,
        status: "DRAFT",
        changeReason,
        createdBy,
      },
    });

  return scheduleVersion;
};

export const getScheduleVersions = async (
  drawId: string
) => {
  return prisma.scheduleVersion.findMany({
    where: {
      drawId,
    },
    orderBy: {
      version: "desc",
    },
  });
};