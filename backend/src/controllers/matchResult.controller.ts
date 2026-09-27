import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { completeMatch } from "../services/matchResult.service";
import { getParam } from "../utils/params";

export const submitMatchResult = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const matchId = getParam(req.params.matchId);

    const {
      winnerEntryId,
      loserEntryId,
      score,
    } = req.body;

    if (!winnerEntryId || !loserEntryId) {
      return res.status(400).json({
        message:
          "Winner and loser are required",
      });
    }

    const result = await completeMatch(
      matchId,
      {
        winnerEntryId,
        loserEntryId,
        score,
      }
    );

    return res.status(200).json({
      message:
        "Match result submitted successfully",
      match: result,
    });
  } catch (error) {
    console.error(
      "Submit match result error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit match result";

    return res.status(400).json({
      message,
    });
  }
};