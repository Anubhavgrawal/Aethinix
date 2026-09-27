import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getEventRankings } from "../services/ranking.service";
import { getParam } from "../utils/params";

export const getRankings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(
      req.params.tournamentId
    );

    const eventId = getParam(
      req.params.eventId
    );

    const result = await getEventRankings(
      tournamentId,
      eventId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get rankings error:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch rankings",
    });
  }
};