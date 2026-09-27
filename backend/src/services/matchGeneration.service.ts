import { prisma } from "../lib/prisma";

export const generateMatchesForDraw = async (drawId: string) => {
  const draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
    include: {
      event: {
        include: {
          category: true,
        },
      },
      rounds: {
        orderBy: {
          roundNumber: "asc",
        },
      },
      positions: {
        include: {
          entry: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!draw) {
    throw new Error("Draw not found");
  }

  if (draw.status !== "DRAFT") {
    throw new Error(
      "Matches can only be generated for a draft draw"
    );
  }

  if (!draw.bracketSize || !draw.totalMatches) {
    throw new Error(
      "Draw calculation is incomplete"
    );
  }

  const existingMatches = await prisma.match.count({
    where: {
      drawId,
    },
  });

  if (existingMatches > 0) {
    throw new Error(
      "Matches have already been generated for this draw"
    );
  }

  const rounds = draw.rounds.sort(
    (a, b) => a.roundNumber - b.roundNumber
  );

  if (rounds.length === 0) {
    throw new Error("No rounds found for this draw");
  }

  const matchesToCreate: {
    tournamentId: string;
    categoryId: string;
    eventId: string;
    drawId: string;
    roundId: string;
    roundName: string;
    matchNumber: number;
    matchId: string;
    playerAEntryId: string | null;
    playerBEntryId: string | null;
    status: string;
  }[] = [];

  let globalMatchNumber = 1;

  /*
   * Create the complete knockout tree.
   *
   * Example for 8 entries:
   *
   * Round 1  → 4 matches
   * Round 2  → 2 matches
   * Final    → 1 match
   *
   * Total    → 7 matches
   */

  for (const round of rounds) {
    const matchesInRound =
      draw.bracketSize /
      Math.pow(2, round.roundNumber);

    for (
      let i = 0;
      i < matchesInRound;
      i++
    ) {
      let playerAEntryId: string | null = null;
      let playerBEntryId: string | null = null;

      /*
       * Only Round 1 gets actual players.
       * Later rounds receive their players
       * automatically through progression.
       */
      if (round.roundNumber === 1) {
        const positionA = i * 2 + 1;
        const positionB = i * 2 + 2;

        const entryA = draw.positions.find(
          (position) =>
            position.position === positionA
        );

        const entryB = draw.positions.find(
          (position) =>
            position.position === positionB
        );

        playerAEntryId =
          entryA?.entryId ?? null;

        playerBEntryId =
          entryB?.entryId ?? null;

        console.log("MATCH PLAYER MAPPING", {
          matchNumber: globalMatchNumber,
          positionA,
          positionB,
          playerAEntryId,
          playerBEntryId,
        });
      }

      matchesToCreate.push({
        tournamentId: draw.tournamentId,
        categoryId: draw.event.categoryId,
        eventId: draw.eventId,
        drawId: draw.id,
        roundId: round.id,
        roundName: round.name,
        matchNumber: globalMatchNumber,

        matchId: `AETH-${new Date().getFullYear()}-${draw.event.category.name}-${draw.event.code}-${round.roundNumber}-${globalMatchNumber}`,

        playerAEntryId,
        playerBEntryId,
        status: "SCHEDULED",
      });

      globalMatchNumber++;
    }
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const createdMatches = [];

      for (const match of matchesToCreate) {
        const createdMatch =
          await tx.match.create({
            data: match,
          });

        createdMatches.push(createdMatch);
      }

      /*
       * Link each match to the match that follows it.
       *
       * Round 1:
       * Match 1 + Match 2 → Match 5
       * Match 3 + Match 4 → Match 6
       *
       * Round 2:
       * Match 5 + Match 6 → Final
       */

      for (
        let i = 0;
        i < createdMatches.length;
        i++
      ) {
        const currentMatch =
          createdMatches[i];

        const currentRound =
          rounds.find(
            (round) =>
              round.id === currentMatch.roundId
          );

        if (!currentRound) {
          continue;
        }

        if (
          currentRound.roundNumber >=
          rounds.length
        ) {
          continue;
        }

        const nextRound =
          rounds.find(
            (round) =>
              round.roundNumber ===
              currentRound.roundNumber + 1
          );

        if (!nextRound) {
          continue;
        }

        const currentRoundMatches =
          createdMatches.filter(
            (match) =>
              match.roundId ===
              currentRound.id
          );

        const currentIndex =
          currentRoundMatches.findIndex(
            (match) =>
              match.id === currentMatch.id
          );

        const nextRoundMatches =
          createdMatches.filter(
            (match) =>
              match.roundId ===
              nextRound.id
          );

        const nextMatchIndex =
          Math.floor(currentIndex / 2);

        const nextMatch =
          nextRoundMatches[
            nextMatchIndex
          ];

        if (!nextMatch) {
          continue;
        }

        const nextMatchSlot =
          currentIndex % 2 === 0
            ? "1"
            : "2";

        await tx.match.update({
          where: {
            id: currentMatch.id,
          },
          data: {
            nextMatchId: nextMatch.id,
            nextMatchSlot,
          },
        });
      }

      return createdMatches;
    }
  );

  return {
    drawId: draw.id,
    matchesCreated: result.length,
    matches: result,
  };
};