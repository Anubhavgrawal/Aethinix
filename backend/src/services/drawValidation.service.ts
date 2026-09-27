import { prisma } from "../lib/prisma";

type ValidationIssue = {
  code: string;
  message: string;
  severity: "ERROR" | "WARNING";
};

export const validateDraw = async (
  drawId: string
) => {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
    include: {
      event: true,
      rounds: {
        include: {
          matches: {
            include: {
              timeSlot: true,
            },
          },
        },
        orderBy: {
          roundNumber: "asc",
        },
      },
      positions: true,
    },
  });

  if (!draw) {
    return {
      valid: false,
      errors: [
        {
          code: "DRAW_NOT_FOUND",
          message: "Draw not found",
          severity: "ERROR" as const,
        },
      ],
      warnings,
    };
  }

  // Draw calculation validation
  if (!draw.bracketSize) {
    errors.push({
      code: "MISSING_BRACKET_SIZE",
      message: "Draw bracket size is missing",
      severity: "ERROR",
    });
  }

  if (draw.bracketSize) {
    const expectedRounds = Math.log2(
      draw.bracketSize
    );

    if (
      !Number.isInteger(expectedRounds) ||
      draw.rounds.length !== expectedRounds
    ) {
      errors.push({
        code: "INVALID_ROUND_COUNT",
        message:
          "Draw round count does not match bracket size",
        severity: "ERROR",
      });
    }
  }

  // Match count validation
  const matchCount = draw.rounds.reduce(
    (total, round) =>
      total + round.matches.length,
    0
  );

  if (
    draw.totalMatches !== null &&
    matchCount !== draw.totalMatches
  ) {
    errors.push({
      code: "INVALID_MATCH_COUNT",
      message:
        `Expected ${draw.totalMatches} matches but found ${matchCount}`,
      severity: "ERROR",
    });
  }

  // Match-level validation
  const allMatches = draw.rounds.flatMap(
    (round) => round.matches
  );

  for (const match of allMatches) {
    if (match.drawId !== draw.id) {
      errors.push({
        code: "INVALID_DRAW_REFERENCE",
        message:
          `Match ${match.id} belongs to another draw`,
        severity: "ERROR",
      });
    }

    // Non-final matches should have progression
    const round = draw.rounds.find(
      (item) => item.id === match.roundId
    );

    if (!round) {
      errors.push({
        code: "INVALID_ROUND_REFERENCE",
        message:
          `Match ${match.id} has an invalid round`,
        severity: "ERROR",
      });

      continue;
    }

    if (
      round.roundNumber <
        draw.rounds.length &&
      !match.nextMatchId
    ) {
      errors.push({
        code: "MISSING_PROGRESSION",
        message:
          `Match ${match.matchNumber} has no next match`,
        severity: "ERROR",
      });
    }

    // Scheduled match checks
    if (match.status === "SCHEDULED") {
      if (!match.timeSlotId) {
        warnings.push({
          code: "MATCH_NOT_SCHEDULED",
          message:
            `Match ${match.matchNumber} has no time slot`,
          severity: "WARNING",
        });
      }

      if (!match.courtId) {
        warnings.push({
          code: "COURT_NOT_ASSIGNED",
          message:
            `Match ${match.matchNumber} has no court`,
          severity: "WARNING",
        });
      }

      if (
        !match.timeSlot?.scheduledStart ||
        !match.timeSlot?.scheduledEnd
      ) {
        warnings.push({
          code: "TIME_NOT_ASSIGNED",
          message:
            `Match ${match.matchNumber} has no scheduled time`,
          severity: "WARNING",
        });
      }
    }
  }

  // Duplicate match number check
  const matchNumbers = new Set<number>();

  for (const match of allMatches) {
    if (matchNumbers.has(match.matchNumber)) {
      errors.push({
        code: "DUPLICATE_MATCH_NUMBER",
        message:
          `Match number ${match.matchNumber} is duplicated`,
        severity: "ERROR",
      });
    }

    matchNumbers.add(match.matchNumber);
  }

  // Draw position validation
  if (
    draw.bracketSize &&
    draw.positions.length !==
      draw.bracketSize
  ) {
    errors.push({
      code: "INVALID_DRAW_POSITIONS",
      message:
        `Expected ${draw.bracketSize} draw positions but found ${draw.positions.length}`,
      severity: "ERROR",
    });
  }

  return {
    valid: errors.length === 0,
    drawId: draw.id,
    eventId: draw.eventId,
    status: draw.status,
    entryCount: draw.positions.filter(
      (position) => position.entryId !== null
    ).length,
    bracketSize: draw.bracketSize,
    byeCount: draw.byeCount,
    totalMatches: matchCount,
    errors,
    warnings,
  };
};