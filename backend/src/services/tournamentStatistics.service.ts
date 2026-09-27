import { prisma } from "../lib/prisma";

export const getTournamentStatistics = async (
  tournamentId: string
) => {
  const [
    events,
    entries,
    matches,
    completedMatches,
    scheduledMatches,
  ] = await Promise.all([
    prisma.event.count({
      where: { tournamentId },
    }),

    prisma.tournamentEntry.count({
      where: {
        tournamentId,
        withdrawn: false,
      },
    }),

    prisma.match.count({
      where: { tournamentId },
    }),

    prisma.match.count({
      where: {
        tournamentId,
        status: "COMPLETED",
      },
    }),

    prisma.match.count({
      where: {
        tournamentId,
        status: "SCHEDULED",
      },
    }),
  ]);

  const pendingMatches =
    matches - completedMatches - scheduledMatches;

  const completionPercentage =
    matches > 0
      ? Math.round(
          (completedMatches / matches) * 100
        )
      : 0;

  return {
    tournamentId,
    statistics: {
      totalEvents: events,
      totalEntries: entries,
      totalMatches: matches,
      completedMatches,
      scheduledMatches,
      pendingMatches,
      completionPercentage,
    },
  };
};