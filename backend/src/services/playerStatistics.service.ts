import { prisma } from "../lib/prisma";

export const updatePlayerStatisticsAfterMatch = async (
  winnerEntryId: string,
  loserEntryId: string
) => {
  const winnerEntry =
    await prisma.tournamentEntry.findUnique({
      where: {
        id: winnerEntryId,
      },
      select: {
        playerId: true,
      },
    });

  const loserEntry =
    await prisma.tournamentEntry.findUnique({
      where: {
        id: loserEntryId,
      },
      select: {
        playerId: true,
      },
    });

  if (!winnerEntry || !loserEntry) {
    throw new Error(
      "Player entry not found"
    );
  }

  const winnerPlayerId =
    winnerEntry.playerId;

  const loserPlayerId =
    loserEntry.playerId;

  await prisma.playerStatistics.upsert({
    where: {
      playerId: winnerPlayerId,
    },
    create: {
      playerId: winnerPlayerId,
      matchesPlayed: 1,
      wins: 1,
      losses: 0,
    },
    update: {
      matchesPlayed: {
        increment: 1,
      },
      wins: {
        increment: 1,
      },
    },
  });

  await prisma.playerStatistics.upsert({
    where: {
      playerId: loserPlayerId,
    },
    create: {
      playerId: loserPlayerId,
      matchesPlayed: 1,
      wins: 0,
      losses: 1,
    },
    update: {
      matchesPlayed: {
        increment: 1,
      },
      losses: {
        increment: 1,
      },
    },
  });
};