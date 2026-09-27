import { prisma } from "../lib/prisma";

type CompleteMatchInput = {
  winnerEntryId: string;
  loserEntryId: string;
  score?: string;
};

export const completeMatch = async (
  matchId: string,
  input: CompleteMatchInput
) => {
  const { winnerEntryId, loserEntryId, score } = input;

  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    if (
      match.status === "COMPLETED" ||
      match.status === "WALKOVER" ||
      match.status === "RETIRED"
    ) {
      throw new Error(
        "This match has already been completed"
      );
    }

    if (
      winnerEntryId !== match.playerAEntryId &&
      winnerEntryId !== match.playerBEntryId
    ) {
      throw new Error(
        "Winner must be one of the players in this match"
      );
    }

    if (
      loserEntryId !== match.playerAEntryId &&
      loserEntryId !== match.playerBEntryId
    ) {
      throw new Error(
        "Loser must be one of the players in this match"
      );
    }

    if (winnerEntryId === loserEntryId) {
      throw new Error(
        "Winner and loser cannot be the same player"
      );
    }

    if (!match.playerAEntryId || !match.playerBEntryId) {
      throw new Error(
        "Both players must be assigned before completing the match"
      );
    }

    const updatedMatch = await tx.match.update({
      where: {
        id: matchId,
      },
      data: {
        winner: {
          connect: {
            id: winnerEntryId,
          },
        },
        loser: {
          connect: {
            id: loserEntryId,
          },
        },
        status: "COMPLETED",
      },
    });

    await tx.matchResult.upsert({
      where: {
        matchId,
      },
      create: {
        matchId,
        winnerEntryId,
        loserEntryId,
        score: score ?? null,
        status: "CONFIRMED",
      },
      update: {
        winnerEntryId,
        loserEntryId,
        score: score ?? null,
      },
    });

    // Automatically advance winner
    if (
      match.nextMatchId &&
      match.nextMatchSlot
    ) {
      const nextMatch = await tx.match.findUnique({
        where: {
          id: match.nextMatchId,
        },
      });

      if (!nextMatch) {
        throw new Error("Next match not found");
      }

      if (match.nextMatchSlot === "1") {
        await tx.match.update({
          where: {
            id: nextMatch.id,
          },
          data: {
            playerA: {
              connect: {
                id: winnerEntryId,
              },
            },
          },
        });
      } else {
        await tx.match.update({
          where: {
            id: nextMatch.id,
          },
          data: {
            playerB: {
              connect: {
                id: winnerEntryId,
              },
            },
          },
        });
      }
    }

    return updatedMatch;
  });
};