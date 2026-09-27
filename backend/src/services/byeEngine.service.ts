import { prisma } from "../lib/prisma";

export const processDrawByes = async (drawId: string) => {
  const matches = await prisma.match.findMany({
    where: {
      drawId,
    },
    orderBy: {
      matchNumber: "asc",
    },
  });

  let walkovers = 0;

  await prisma.$transaction(async (tx) => {
    for (const match of matches) {
      // Only first-round matches can contain
      // direct entry positions/byes.
      const round = await tx.round.findUnique({
        where: {
          id: match.roundId,
        },
      });

      if (!round) {
        continue;
      }

      /*
      * Single-entry event:
      * The only participant automatically
      * advances as the winner.
      */
      if (
        round.roundNumber ===
          (await tx.round.count({
            where: {
              drawId,
            },
          })) &&
        !match.playerAEntryId &&
        !match.playerBEntryId
      ) {
        const drawPosition =
          await tx.drawPosition.findFirst({
            where: {
              drawId,
              entryId: {
                not: null,
              },
            },
            orderBy: {
              position: "asc",
            },
          });

        if (drawPosition?.entryId) {
          await tx.match.update({
            where: {
              id: match.id,
            },
            data: {
              status: "WALKOVER",
              playerAEntryId:
                drawPosition.entryId,
              winnerEntryId:
                drawPosition.entryId,
              loserEntryId: null,
            },
          });

          walkovers++;
        }

        continue;
      }

      if (round.roundNumber !== 1) {
        continue;
      }

      const playerA = match.playerAEntryId;
      const playerB = match.playerBEntryId;

      // Both positions empty = no direct bye.
      if (!playerA && !playerB) {
        continue;
      }

      // Both players present = normal match.
      if (playerA && playerB) {
        continue;
      }

      // One player missing = BYE.
      const winnerEntryId = playerA ?? playerB;

      await tx.match.update({
        where: {
          id: match.id,
        },
        data: {
          status: "WALKOVER",
          winnerEntryId,
          loserEntryId: null,
        },
      });

      walkovers++;

      // Automatically advance the player
      // into the correct slot of the next match.
      if (
        match.nextMatchId &&
        match.nextMatchSlot
      ) {
        if (match.nextMatchSlot === "1") {
          await tx.match.update({
            where: {
              id: match.nextMatchId,
            },
            data: {
              playerAEntryId: winnerEntryId,
            },
          });
        } else {
          await tx.match.update({
            where: {
              id: match.nextMatchId,
            },
            data: {
              playerBEntryId: winnerEntryId,
            },
          });
        }
      }
    }
  });

  return {
    drawId,
    walkovers,
    message: "Bye processing completed successfully",
  };
};