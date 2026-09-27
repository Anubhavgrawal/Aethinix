import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getTournamentStatistics } from "../services/tournamentStatistics.service";
import { getParam } from "../utils/params";

export const getTournamentStatisticsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(
      req.params.tournamentId
    );

    if (!tournamentId) {
      return res.status(400).json({
        message: "Tournament ID is required",
      });
    }

    const result = await getTournamentStatistics(
      tournamentId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Get tournament statistics error:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch tournament statistics",
    });
  }
};