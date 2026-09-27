import { prisma } from "../lib/prisma";
import { checkPlayerScheduleConflict } from "./scheduleConflict.service";
import { createFixtureConflict } from "./fixtureConflict.service";

export const assignMatchesToSlots = async (
  drawId: string
) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
    include: {
      event: {
        include: {
          category: {
            include: {
              tournament: {
                include: {
                  tournamentRule: true,
                },
              },
            },
          },
        },
      },
      rounds: {
        orderBy: {
          roundNumber: "asc",
        },
      },
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  const matches = await prisma.match.findMany({
    where: {
    drawId,
    status: "SCHEDULED",
    OR: [
      {
        timeSlotId: null,
      },
      {
        courtId: null,
      },
    ],
  },
    orderBy: [
      {
        roundId: "asc",
      },
      {
        matchNumber: "asc",
      },
    ],
  });

  if (matches.length === 0) {
    throw new Error("No unscheduled matches found");
  }

  /*
   * TimeSlot contains scheduledStart / scheduledEnd.
   * Court assignment is stored directly on Match.
   */
  const slots = await prisma.timeSlot.findMany({
    where: {
      tournamentId: draw.tournamentId,
    },
    orderBy: {
      scheduledStart: "asc",
    },
  });

  if (slots.length === 0) {
    throw new Error("No available time slots found");
  }

  /*
   * Only active courts are available for match scheduling.
   * Courts are loaded from the tournament's configured venues.
   */
  const courts = await prisma.court.findMany({
    where: {
      venue: {
        tournamentId: draw.tournamentId,
      },
      active: true,
    },
    orderBy: {
      number: "asc",
    },
  });

  if (courts.length === 0) {
    throw new Error("No active courts are available");
  }

  const scheduledMatches = await prisma.match.findMany({
    where: {
      drawId,
      timeSlotId: {
        not: null,
      },
    },
    include: {
      timeSlot: true,
    },
  });

  const assignments: {
    matchId: string;
    timeSlotId: string;
    courtId: string;
  }[] = [];

  for (const match of matches) {
    let assignedSlot: (typeof slots)[number] | null = null;
    let assignedCourt: (typeof courts)[number] | null = null;

    for (const slot of slots) {
      const isMatchCurrentSlot =
        match.timeSlotId === slot.id;

      const slotAlreadyUsed =
        !isMatchCurrentSlot &&
        (
          scheduledMatches.some(
            (scheduled) =>
              scheduled.id !== match.id &&
              scheduled.timeSlotId === slot.id
          ) ||
          assignments.some(
            (assignment) =>
              assignment.timeSlotId === slot.id
          )
        );

      if (slotAlreadyUsed) {
        continue;
      }

      /*
       * Player / Cross-event conflict check.
       *
       * A player cannot be assigned to another
       * overlapping match.
       */
      const playerEntryIds = [
        match.playerAEntryId,
        match.playerBEntryId,
      ].filter(
        (entryId): entryId is string =>
          Boolean(entryId)
      );

      const conflict =
        await checkPlayerScheduleConflict(
          match.id,
          playerEntryIds,
          slot.scheduledStart,
          slot.scheduledEnd
        );

      if (conflict.hasConflict) {
        await createFixtureConflict({
          tournamentId: draw.tournamentId,
          matchId: match.id,
          type: "PLAYER_CONFLICT",
          message:
            conflict.reason ??
            "Player schedule conflict",
          severity: "ERROR",
        });

        continue;
      }

      /*
       * Minimum rest check.
       */
      const minimumRestMinutes =
        draw.event.category.tournament
          .tournamentRule
          ?.minimumRestMin ?? 30;

      const playerMatches =
        scheduledMatches.filter((scheduled) => {
          return (
            (scheduled.playerAEntryId !== null &&
              playerEntryIds.includes(
                scheduled.playerAEntryId
              )) ||
            (scheduled.playerBEntryId !== null &&
              playerEntryIds.includes(
                scheduled.playerBEntryId
              ))
          );
        });

      const restConflict =
        playerMatches.some(
          (previousMatch) => {
            const previousEnd =
              previousMatch.timeSlot?.scheduledEnd;

            if (!previousEnd) {
              return false;
            }

            const restMinutes =
              (slot.scheduledStart.getTime() -
                previousEnd.getTime()) /
              60000;

            return (
              restMinutes <
              minimumRestMinutes
            );
          }
        );

      if (restConflict) {
        await createFixtureConflict({
          tournamentId: draw.tournamentId,
          matchId: match.id,
          type: "MINIMUM_REST",
          message: `Minimum rest requirement of ${minimumRestMinutes} minutes is not satisfied`,
          severity: "ERROR",
        });

        continue;
      }

      /*
       * Select an active court.
       *
       * Court selection is DB-driven and supports
       * multiple active courts without hardcoding.
       */
      assignedCourt =
        courts[assignments.length % courts.length];

      assignedSlot = slot;
      break;
    }

    if (!assignedSlot || !assignedCourt) {
      continue;
    }

    assignments.push({
      matchId: match.id,
      timeSlotId: assignedSlot.id,
      courtId: assignedCourt.id,
    });
  }

  await prisma.$transaction(
    async (tx) => {
      for (const assignment of assignments) {
        const slot =
          await tx.timeSlot.findUnique({
            where: {
              id: assignment.timeSlotId,
            },
          });

        if (!slot) {
          continue;
        }

        await tx.match.update({
          where: {
            id: assignment.matchId,
          },
          data: {
            timeSlotId: slot.id,
            courtId: assignment.courtId,
          },
        });

        /*
         * Match successfully scheduled.
         *
         * Any old unresolved conflicts for this match
         * are now resolved.
         */
        await tx.fixtureConflict.updateMany({
          where: {
            matchId: assignment.matchId,
            resolved: false,
          },
          data: {
            resolved: true,
          },
        });
      }
    }
  );

  return {
    drawId,
    totalMatches: matches.length,
    assignedMatches: assignments.length,
    unassignedMatches:
      matches.length - assignments.length,
  };
};