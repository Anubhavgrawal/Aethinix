import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateKnockoutDraw } from "../services/drawEngine.service";
import { generateMatchesForDraw } from "../services/matchGeneration.service";
import { processDrawByes } from "../services/byeEngine.service";
import { prisma } from "../lib/prisma";
import { getParam } from "../utils/params";

export const generateDraw = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);
    const eventId = getParam(req.params.eventId);

    // Step 1: Generate the draw structure
    const drawResult = await generateKnockoutDraw(
      tournamentId,
      eventId
    );

    // Step 2: Generate actual matches
    const matchResult = await generateMatchesForDraw(
      drawResult.draw.id
    );

    // Step 3: Process BYEs and automatically
    // advance players to the next match
    const byeResult = await processDrawByes(
      drawResult.draw.id
    );

    return res.status(201).json({
      message: "Draw and matches generated successfully",
      draw: drawResult.draw,
      calculation: drawResult.calculation,
      matchesCreated: matchResult.matchesCreated,
      walkovers: byeResult.walkovers,
    });
  } catch (error) {
    console.error("Generate draw error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate draw";

    return res.status(400).json({
      message,
    });
  }
};

export const getEventDraw = async (req: AuthRequest, res: Response) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);
    const eventId = getParam(req.params.eventId);

    const draw = await prisma.draw.findFirst({
      where: {
        tournamentId,
        eventId,
      },
      orderBy: {
        version: "desc",
      },
      include: {
        event: true,

        positions: {
          include: {
            entry: {
              include: {
                player: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },

        rounds: {
          include: {
            matches: {
              include: {
                playerA: {
                  include: {
                    player: true,
                  },
                },
                playerB: {
                  include: {
                    player: true,
                  },
                },
                court: true,
                timeSlot: true,
              },
              orderBy: { matchNumber: "asc" },
            },
          },
          orderBy: {
            roundNumber: "asc",
          },
        },
      },
    });

    console.log(
      "DRAW POSITIONS:",
      draw?.positions?.map((p) => ({
        position: p.position,
        entryId: p.entryId,
      }))
    );

    console.log(
      "DRAW MATCHES:",
      draw?.rounds?.flatMap((r) =>
        r.matches.map((m) => ({
          matchNumber: m.matchNumber,
          playerAEntryId: m.playerAEntryId,
          playerBEntryId: m.playerBEntryId,
        }))
      )
    );

    console.log(
      "FULL MATCH DATA:",
      JSON.stringify(
        draw?.rounds?.flatMap(
          (round) => round.matches
        ),
        null,
        2
      )
    );

    if (!draw) {
      return res.status(404).json({
        message: "No draw found for this event",
      });
    }

    return res.status(200).json(draw);
  } catch (error) {
    console.error("Get event draw error:", error);

    return res.status(500).json({
      message: "Failed to fetch event draw",
    });
  }
};