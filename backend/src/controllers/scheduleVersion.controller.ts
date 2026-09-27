import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createScheduleVersion,
  getScheduleVersions,
} from "../services/scheduleVersion.service";
import { getParam } from "../utils/params";

export const createVersion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);
    const { changeReason } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const version = await createScheduleVersion(
      drawId,
      req.user.userId,
      changeReason
    );

    return res.status(201).json({
      message: "Schedule version created",
      version,
    });
  } catch (error) {
    console.error(
      "Create schedule version error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create schedule version";

    return res.status(400).json({
      message,
    });
  }
};

export const getVersions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const drawId = getParam(req.params.drawId);

    const versions =
      await getScheduleVersions(drawId);

    return res.status(200).json({
      versions,
    });
  } catch (error) {
    console.error(
      "Get schedule versions error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get schedule versions";

    return res.status(400).json({
      message,
    });
  }
};