import { prisma } from "../lib/prisma";

export const getEventRankings = async (
  tournamentId: string,
  eventId: string
) => {
  const entries = await prisma.tournamentEntry.findMany({
    where: {
      tournamentId,
      eventId,
      withdrawn: false,
    },
    include: {
      player: true,
    },
  });

  const completedMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      eventId,
      status: "COMPLETED",
    },
    select: {
      winnerEntryId: true,
      loserEntryId: true,
    },
  });

  const stats = new Map<
    string,
    {
      wins: number;
      losses: number;
      points: number;
    }
  >();

  for (const entry of entries) {
    stats.set(entry.id, {
      wins: 0,
      losses: 0,
      points: Number(entry.rankingPoints ?? 0),
    });
  }

  for (const match of completedMatches) {
    if (match.winnerEntryId) {
      const winner = stats.get(match.winnerEntryId);

      if (winner) {
        winner.wins += 1;
        winner.points += 1;
      }
    }

    if (match.loserEntryId) {
      const loser = stats.get(match.loserEntryId);

      if (loser) {
        loser.losses += 1;
      }
    }
  }

  const rankings = entries
    .map((entry) => {
      const playerStats = stats.get(entry.id)!;

      return {
        entryId: entry.id,
        playerId: entry.player?.playerId ?? null,
        playerName:
            entry.player?.name ??
            (
                [entry.player?.firstName, entry.player?.lastName]
                .filter(Boolean)
                .join(" ") ||
                entry.player?.playerId ||
                "Unknown"
            ),
        seed: entry.seed,
        wins: playerStats.wins,
        losses: playerStats.losses,
        rankingPoints: playerStats.points,
      };
    })
    .sort((a, b) => {
      if (b.rankingPoints !== a.rankingPoints) {
        return b.rankingPoints - a.rankingPoints;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.playerName.localeCompare(b.playerName);
    })
    .map((player, index) => ({
      rank: index + 1,
      ...player,
    }));

  return {
    tournamentId,
    eventId,
    rankings,
  };
};