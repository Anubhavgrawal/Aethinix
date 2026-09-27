import { prisma } from "../lib/prisma";
import { createFixtureConflict } from "./fixtureConflict.service";

export type ScheduleValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export const validateSchedule = async (
  drawId: string
): Promise<ScheduleValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

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
      matches: {
        where: {
          timeSlotId: {
            not: null,
          },
        },
        include: {
          timeSlot: true,
        },
        orderBy: {
          matchNumber: "asc",
        },
      },
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  /*
   * Scheduled matches belonging to this draw.
   */
  const matches = draw.matches;

  /*
   * All scheduled matches in the tournament.
   *
   * Required for cross-event player conflict detection.
   */
  const tournamentMatches =
    await prisma.match.findMany({
      where: {
        tournamentId: draw.tournamentId,
        timeSlotId: {
          not: null,
        },
      },
      include: {
        timeSlot: true,
      },
      orderBy: {
        timeSlot: {
          scheduledStart: "asc",
        },
      },
    });

  /*
   * =====================================================
   * 1. DRAW COMPLETENESS
   * =====================================================
   */

  const allDrawMatches =
    await prisma.match.findMany({
      where: {
        drawId,
      },
      orderBy: {
        matchNumber: "asc",
      },
    });

  if (allDrawMatches.length === 0) {
    errors.push(
      "Draw does not contain any matches"
    );
  }

  const expectedMatches =
    draw.bracketSize
      ? draw.bracketSize - 1
      : null;

  if (
    expectedMatches !== null &&
    allDrawMatches.length !== expectedMatches
  ) {
    errors.push(
      `Draw match count is invalid. Expected ${expectedMatches}, found ${allDrawMatches.length}`
    );
  }

  /*
   * Every non-final match must have a valid
   * progression link.
   */
  const finalRound =
    draw.rounds[draw.rounds.length - 1];

  for (const match of allDrawMatches) {
    const isFinal =
      finalRound?.id === match.roundId;

    if (!isFinal && !match.nextMatchId) {
      errors.push(
        `Match ${match.matchId} has no next match progression`
      );
    }

    if (
      match.nextMatchId &&
      match.nextMatchSlot !== "1" &&
      match.nextMatchSlot !== "2"
    ) {
      errors.push(
        `Match ${match.matchId} has an invalid next match slot`
      );
    }
  }

  /*
   * =====================================================
   * 2. SCHEDULE EXISTENCE
   * =====================================================
   */

  if (matches.length === 0) {
    errors.push(
      "No scheduled matches found"
    );

    return {
      valid: false,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
    };
  }

  /*
   * =====================================================
   * 3. TOURNAMENT RULES
   * =====================================================
   */

  const minimumRestMinutes =
    draw.event.category.tournament
      .tournamentRule
      ?.minimumRestMin ?? 30;

  const rule =
    draw.event.category.tournament
      .tournamentRule;

  /*
   * =====================================================
   * 4. COURT CONFLICT
   * =====================================================
   */

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];

    const currentStart =
      current.timeSlot?.scheduledStart;

    const currentEnd =
      current.timeSlot?.scheduledEnd;

    if (
      !currentStart ||
      !currentEnd ||
      !current.courtId
    ) {
      continue;
    }

    for (
      let j = i + 1;
      j < matches.length;
      j++
    ) {
      const other = matches[j];

      const otherStart =
        other.timeSlot?.scheduledStart;

      const otherEnd =
        other.timeSlot?.scheduledEnd;

      if (
        !otherStart ||
        !otherEnd ||
        !other.courtId
      ) {
        continue;
      }

      const sameCourt =
        current.courtId === other.courtId;

      const overlapping =
        currentStart < otherEnd &&
        currentEnd > otherStart;

      if (
        sameCourt &&
        overlapping
      ) {
        errors.push(
          `Court conflict between ${current.matchId} and ${other.matchId}`
        );
      }
    }
  }

  /*
   * =====================================================
   * 5. PLAYER / CROSS-EVENT CONFLICT
   * =====================================================
   */

  const playerMatches =
    new Map<
      string,
      typeof tournamentMatches
    >();

  for (const match of tournamentMatches) {
    const playerIds = [
      match.playerAEntryId,
      match.playerBEntryId,
    ].filter(
      (id): id is string =>
        Boolean(id)
    );

    for (const playerId of playerIds) {
      const existing =
        playerMatches.get(playerId) ?? [];

      existing.push(match);

      playerMatches.set(
        playerId,
        existing
      );
    }
  }

  for (const [
    playerId,
    playerMatchList,
  ] of playerMatches) {
    playerMatchList.sort(
      (a, b) => {
        const aStart =
          a.timeSlot?.scheduledStart?.getTime() ??
          0;

        const bStart =
          b.timeSlot?.scheduledStart?.getTime() ??
          0;

        return aStart - bStart;
      }
    );

    for (
      let i = 0;
      i < playerMatchList.length - 1;
      i++
    ) {
      const current =
        playerMatchList[i];

      const next =
        playerMatchList[i + 1];

      const currentEnd =
        current.timeSlot?.scheduledEnd;

      const nextStart =
        next.timeSlot?.scheduledStart;

      if (
        !currentEnd ||
        !nextStart
      ) {
        continue;
      }

      const gapMinutes =
        (nextStart.getTime() -
          currentEnd.getTime()) /
        60000;

      /*
       * Overlapping matches.
       */
      if (gapMinutes < 0) {
        errors.push(
          `Player conflict for entry ${playerId}: ${current.matchId} and ${next.matchId}`
        );

        continue;
      }

      /*
       * Minimum rest requirement.
       */
      if (
        gapMinutes <
        minimumRestMinutes
      ) {
        errors.push(
          `Minimum rest conflict for entry ${playerId}: ${current.matchId} and ${next.matchId}`
        );
      }
    }
  }

  /*
   * =====================================================
   * 6. TOURNAMENT OPERATING HOURS
   * =====================================================
   */

  if (
    rule?.operatingStartTime &&
    rule?.operatingEndTime
  ) {
    const ruleStartMinutes =
      Number(
        rule.operatingStartTime
          .split(":")[0]
      ) *
        60 +
      Number(
        rule.operatingStartTime
          .split(":")[1]
      );

    const ruleEndMinutes =
      Number(
        rule.operatingEndTime
          .split(":")[0]
      ) *
        60 +
      Number(
        rule.operatingEndTime
          .split(":")[1]
      );

    for (const match of matches) {
      const scheduledStart =
        match.timeSlot?.scheduledStart;

      const scheduledEnd =
        match.timeSlot?.scheduledEnd;

      if (
        !scheduledStart ||
        !scheduledEnd
      ) {
        continue;
      }

      const startMinutes =
        scheduledStart.getHours() *
          60 +
        scheduledStart.getMinutes();

      const endMinutes =
        scheduledEnd.getHours() *
          60 +
        scheduledEnd.getMinutes();

      if (
        startMinutes <
          ruleStartMinutes ||
        endMinutes >
          ruleEndMinutes
      ) {
        errors.push(
          `Match ${match.matchId} is outside tournament operating hours`
        );
      }
    }
  }

  /*
   * =====================================================
   * 7. MISSING COURT / TIME
   * =====================================================
   */

  const allScheduledCheckMatches =
    await prisma.match.findMany({
      where: {
        drawId,
      },
      include: {
        timeSlot: true,
      },
      orderBy: {
        matchNumber: "asc",
      },
    });

  for (const match of allScheduledCheckMatches) {
    if (!match.timeSlot?.scheduledStart) {
      errors.push(
        `Match ${match.matchId} has no start time`
      );
    }

    if (!match.timeSlot?.scheduledEnd) {
      errors.push(
        `Match ${match.matchId} has no end time`
      );
    }

    if (!match.courtId) {
      errors.push(
        `Match ${match.matchId} has no court assigned`
      );
    }
  }

  /*
   * =====================================================
   * 8. UNSCHEDULED MATCHES
   * =====================================================
   */

  const totalDrawMatches =
    allDrawMatches.length;

  const scheduledDrawMatches =
    matches.length;

  if (
    scheduledDrawMatches <
    totalDrawMatches
  ) {
    warnings.push(
      `${totalDrawMatches - scheduledDrawMatches} match(es) are not scheduled yet`
    );
  }

  /*
   * =====================================================
   * 9. SAVE VALIDATION CONFLICTS
   * =====================================================
   */

  for (const match of allDrawMatches) {
    const matchErrors = errors.filter(
      (error) =>
        error.includes(match.matchId)
    );

    if (matchErrors.length === 0) {
      continue;
    }

    for (const message of matchErrors) {
      let type = "SCHEDULE_VALIDATION";

      if (message.includes("Court conflict")) {
        type = "COURT_CONFLICT";
      } else if (
        message.includes("Player conflict")
      ) {
        type = "PLAYER_CONFLICT";
      } else if (
        message.includes("Minimum rest conflict")
      ) {
        type = "MINIMUM_REST";
      } else if (
        message.includes(
          "outside tournament operating hours"
        )
      ) {
        type = "OPERATING_HOURS";
      } else if (
        message.includes("no start time")
      ) {
        type = "MISSING_START_TIME";
      } else if (
        message.includes("no end time")
      ) {
        type = "MISSING_END_TIME";
      } else if (
        message.includes("no court assigned")
      ) {
        type = "MISSING_COURT";
      } else if (
        message.includes(
          "no next match progression"
        )
      ) {
        type = "PROGRESSION_ERROR";
      } else if (
        message.includes(
          "invalid next match slot"
        )
      ) {
        type = "PROGRESSION_ERROR";
      }

      await createFixtureConflict({
        tournamentId: draw.tournamentId,
        matchId: match.id,
        type,
        message,
        severity: "ERROR",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
};