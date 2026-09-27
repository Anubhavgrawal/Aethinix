import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  validateScheduleVersion,
  approveScheduleVersion,
  publishScheduleVersion,
} from "../services/scheduleVersionLifecycle.service";
import { getParam } from "../utils/params";

export const validateVersion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const versionId = getParam(req.params.versionId);

    const version =
      await validateScheduleVersion(versionId);

    return res.status(200).json({
      message: "Schedule version validated",
      version,
    });
  } catch (error) {
    console.error(
      "Validate schedule version error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to validate schedule version";

    return res.status(400).json({
      message,
    });
  }
};

export const approveVersion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const versionId = getParam(req.params.versionId);

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const version =
      await approveScheduleVersion(
        versionId,
        req.user.userId
      );

    return res.status(200).json({
      message: "Schedule version approved",
      version,
    });
  } catch (error) {
    console.error(
      "Approve schedule version error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to approve schedule version";

    return res.status(400).json({
      message,
    });
  }
};

export const publishVersion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const versionId = getParam(req.params.versionId);

    const version =
      await publishScheduleVersion(versionId);

    return res.status(200).json({
      message: "Schedule version published",
      version,
    });
  } catch (error) {
    console.error(
      "Publish schedule version error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to publish schedule version";

    return res.status(400).json({
      message,
    });
  }
};