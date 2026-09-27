import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getParam } from "../utils/params";
import { validateTournamentEvent } from "../services/fixtureValidation.service";

export const validateFixtureEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tournamentId = getParam(req.params.tournamentId);
    const eventId = getParam(req.params.eventId);

    const result = await validateTournamentEvent(
      tournamentId,
      eventId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Fixture validation error:", error);

    return res.status(500).json({
      message: "Failed to validate fixture event",
    });
  }
};