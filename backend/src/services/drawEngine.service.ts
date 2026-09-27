import { prisma } from "../lib/prisma";
import { validateTournamentEvent } from "./fixtureValidation.service";

type DrawCalculation = {
  entryCount: number;
  bracketSize: number;
  byeCount: number;
  totalMatches: number;
  rounds: number;
};

const getNextPowerOfTwo = (value: number): number => {
  let power = 1;

  while (power < value) {
    power *= 2;
  }

  return power;
};

const calculateKnockout = (
  entryCount: number
): DrawCalculation => {
  const bracketSize = getNextPowerOfTwo(entryCount);

  const byeCount = bracketSize - entryCount;

  const totalMatches = entryCount - 1;

  const rounds = Math.log2(bracketSize);

  return {
    entryCount,
    bracketSize,
    byeCount,
    totalMatches,
    rounds,
  };
};

export const generateKnockoutDraw = async (
  tournamentId: string,
  eventId: string
) => {
  const validation = await validateTournamentEvent(
    tournamentId,
    eventId
  );

  if (!validation.valid) {
    throw new Error(
      `Draw generation blocked: ${validation.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      tournamentId,
      eventId,
    },
    include: {
      player: true,
    },
    orderBy: {
      rankingPoints: "desc",
    },
  });

  const calculation = calculateKnockout(entries.length);

  const existingDraw = await prisma.draw.findFirst({
    where: {
      tournamentId,
      eventId,
      status: {
        not: "LOCKED",
      },
    },
  });

  if (existingDraw) {
    throw new Error(
      "An active draw already exists for this event"
    );
  }

  const randomizationSeed =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

  const draw = await prisma.$transaction(async (tx) => {
    const newDraw = await tx.draw.create({
      data: {
        tournamentId,
        eventId,
        version: 1,
        status: "DRAFT",
        bracketSize: calculation.bracketSize,
        byeCount: calculation.byeCount,
        totalMatches: calculation.totalMatches,
        randomizationSeed,
        generatedAt: new Date(),
      },
    });

    const rounds = [];

    for (let roundNumber = 1; roundNumber <= calculation.rounds; roundNumber++) {
      const matchesInRound =
        calculation.bracketSize /
        Math.pow(2, roundNumber);

      const round = await tx.round.create({
        data: {
          drawId: newDraw.id,
          roundNumber,
          name:
            roundNumber === calculation.rounds
              ? "FINAL"
              : `ROUND ${roundNumber}`,
        },
      });

      rounds.push({
        round,
        matchesInRound,
      });
    }

    const firstRound = rounds[0];

    const seededEntries = entries
      .filter((entry) => entry.seed !== null)
      .sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));

    const unseededEntries = entries
      .filter((entry) => entry.seed === null)
      .sort(() => Math.random() - 0.5);

    const orderedEntries = [
      ...seededEntries,
      ...unseededEntries,
    ];

    for (
      let index = 0;
      index < firstRound.matchesInRound;
      index++
    ) {
      const playerA = orderedEntries[index * 2];
      const playerB = orderedEntries[index * 2 + 1];

      await tx.drawPosition.create({
        data: {
          drawId: newDraw.id,
          position: index * 2 + 1,
          entryId: playerA?.id ?? null,
        },
      });

      await tx.drawPosition.create({
        data: {
          drawId: newDraw.id,
          position: index * 2 + 2,
          entryId: playerB?.id ?? null,
        },
      });
    }

    return newDraw;
  });

  return {
    draw,
    calculation,
    message: "Knockout draw generated successfully",
  };
};