import { prisma } from "../lib/prisma";

type ValidationIssue = {
  code: string;
  message: string;
  severity: "ERROR" | "WARNING";
};

export const validateTournamentEvent = async (
  tournamentId: string,
  eventId: string
) => {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      tournamentId,
    },
    include: {
      category: true,
      entries: {
        include: {
          player: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    errors.push({
      code: "EVENT_NOT_FOUND",
      message: "Event does not belong to this tournament",
      severity: "ERROR",
    });

    return {
      valid: false,
      errors,
      warnings,
      entryCount: 0,
    };
  }

  // Minimum entries
  if (event.entries.length < 2) {
    errors.push({
      code: "INSUFFICIENT_ENTRIES",
      message: "At least 2 valid entries are required to generate a draw",
      severity: "ERROR",
    });
  }

  // Player validation
  for (const entry of event.entries) {
    if (!entry.playerId) {
      errors.push({
        code: "MISSING_PLAYER",
        message: `Entry ${entry.id} has no player`,
        severity: "ERROR",
      });
    }

    const playerName = entry.player.user?.name;

    if (!entry.player.playerId) {
      errors.push({
        code: "MISSING_PLAYER_ID",
        message: `Player ${playerName ?? entry.playerId} does not have a Player ID`,
        severity: "ERROR",
      });
    }

    if (!playerName) {
      errors.push({
        code: "MISSING_PLAYER_NAME",
        message: `Entry ${entry.id} has no player name`,
        severity: "ERROR",
      });
    }

    if (!entry.player.gender) {
      warnings.push({
        code: "MISSING_GENDER",
        message: `Player ${playerName ?? entry.playerId} has no gender configured`,
        severity: "WARNING",
      });
    }

    if (!entry.player.dateOfBirth) {
      warnings.push({
        code: "MISSING_DOB",
        message: `Player ${playerName ?? entry.playerId} has no date of birth configured`,
        severity: "WARNING",
      });
    }
  }

  // Duplicate player check
  const playerCounts = new Map<string, number>();

  for (const entry of event.entries) {
    playerCounts.set(
      entry.playerId,
      (playerCounts.get(entry.playerId) ?? 0) + 1
    );
  }

  for (const [playerId, count] of playerCounts) {
    if (count > 1) {
      const player = event.entries.find(
        (entry) => entry.playerId === playerId
      )?.player;

      const playerName = player?.user?.name;

      errors.push({
        code: "DUPLICATE_PLAYER",
        message: `Player ${playerName ?? playerId} appears multiple times in this event`,
        severity: "ERROR",
      });
    }
  }

  // Duplicate seed check
  const seededEntries = event.entries.filter(
    (entry) => entry.seed !== null
  );

  const seedCounts = new Map<number, number>();

  for (const entry of seededEntries) {
    const seed = entry.seed!;

    seedCounts.set(
      seed,
      (seedCounts.get(seed) ?? 0) + 1
    );
  }

  for (const [seed, count] of seedCounts) {
    if (count > 1) {
      errors.push({
        code: "DUPLICATE_SEED",
        message: `Seed ${seed} is assigned to multiple entries`,
        severity: "ERROR",
      });
    }
  }

  // Ranking points warning
  const missingRanking = event.entries.filter(
    (entry) => entry.rankingPoints === null
  );

  if (missingRanking.length > 0) {
    warnings.push({
      code: "MISSING_RANKING_POINTS",
      message: `${missingRanking.length} entry(s) have no ranking points`,
      severity: "WARNING",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    entryCount: event.entries.length,
    event: {
      id: event.id,
      name: event.name,
      code: event.code,
      eventType: event.eventType,
    },
  };
};