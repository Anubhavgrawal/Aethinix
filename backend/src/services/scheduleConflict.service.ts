import { prisma } from "../lib/prisma";

type ConflictResult = {
  hasConflict: boolean;
  reason?: string;
};

export const checkPlayerScheduleConflict = async (
  matchId: string,
  playerEntryIds: string[],
  startTime: Date,
  endTime: Date
): Promise<ConflictResult> => {
  const validEntryIds = playerEntryIds.filter(
    Boolean
  );

  if (validEntryIds.length === 0) {
    return {
      hasConflict: false,
    };
  }

  const existingMatches = await prisma.match.findMany({
    where: {
      id: {
        not: matchId,
      },
      status: {
        notIn: ["CANCELLED", "POSTPONED"],
      },
      OR: [
        {
          playerAEntryId: {
            in: validEntryIds,
          },
        },
        {
          playerBEntryId: {
            in: validEntryIds,
          },
        },
      ],
    },
    include: {
      event: true,
      timeSlot: true,
    },
  });

  const currentMatch = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
    select: {
      eventId: true,
    },
  });

  for (const existingMatch of existingMatches) {
    const existingStart =
      existingMatch.timeSlot?.scheduledStart;

    const existingEnd =
      existingMatch.timeSlot?.scheduledEnd;

    if (!existingStart || !existingEnd) {
      continue;
    }

    const overlaps =
      startTime < existingEnd &&
      endTime > existingStart;

    if (!overlaps) {
      continue;
    }

    const sameEvent =
      existingMatch.eventId ===
      currentMatch?.eventId;

    return {
      hasConflict: true,
      reason: sameEvent
        ? "Player has another match at the same time"
        : "Cross-event player conflict detected",
    };
  }

  return {
    hasConflict: false,
  };
};