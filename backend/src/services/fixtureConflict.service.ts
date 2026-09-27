import { prisma } from "../lib/prisma";

type ConflictInput = {
  tournamentId: string;
  matchId: string;
  type: string;
  message: string;
  severity?: string;
};

export const createFixtureConflict = async (
  data: ConflictInput
) => {
  const existingConflict =
    await prisma.fixtureConflict.findFirst({
      where: {
        matchId: data.matchId,
        type: data.type,
        resolved: false,
      },
    });

  if (existingConflict) {
    return existingConflict;
  }

  return prisma.fixtureConflict.create({
    data: {
      tournamentId: data.tournamentId,
      matchId: data.matchId,
      type: data.type,
      message: data.message,
      severity: data.severity ?? "ERROR",
    },
  });
};

export const getMatchConflicts = async (
  matchId: string
) => {
  return prisma.fixtureConflict.findMany({
    where: {
      matchId,
      resolved: false,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getTournamentConflicts = async (
  tournamentId: string
) => {
  return prisma.fixtureConflict.findMany({
    where: {
      tournamentId,
      resolved: false,
    },
    include: {
      match: {
        select: {
          id: true,
          matchId: true,
          matchNumber: true,
          roundName: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const resolveFixtureConflict = async (
  conflictId: string
) => {
  const conflict =
    await prisma.fixtureConflict.findUnique({
      where: {
        id: conflictId,
      },
    });

  if (!conflict) {
    throw new Error("Fixture conflict not found");
  }

  return prisma.fixtureConflict.update({
    where: {
      id: conflictId,
    },
    data: {
      resolved: true,
    },
  });
};

export const resolveMatchConflicts = async (
  matchId: string,
  types?: string[]
) => {
  return prisma.fixtureConflict.updateMany({
    where: {
      matchId,
      resolved: false,
      ...(types && types.length > 0
        ? {
            type: {
              in: types,
            },
          }
        : {}),
    },
    data: {
      resolved: true,
    },
  });
};