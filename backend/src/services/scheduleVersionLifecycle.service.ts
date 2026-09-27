import { prisma } from "../lib/prisma";
import { validateSchedule } from "./scheduleValidation.service";

export const validateScheduleVersion = async (
  versionId: string
) => {
  const version =
    await prisma.scheduleVersion.findUnique({
      where: {
        id: versionId,
      },
      include: {
        draw: true,
      },
    });

  if (!version) {
    throw new Error("Schedule version not found");
  }

  if (version.status !== "DRAFT") {
    throw new Error(
      "Only a draft schedule version can be validated"
    );
  }

  await prisma.scheduleVersion.update({
    where: {
      id: versionId,
    },
    data: {
      status: "VALIDATING",
    },
  });

  try {
    const validation =
      await validateSchedule(version.drawId);

    if (!validation.valid) {
      await prisma.scheduleVersion.update({
        where: {
          id: versionId,
        },
        data: {
          status: "DRAFT",
        },
      });

      return {
        valid: false,
        validation,
      };
    }

    const validatedVersion =
      await prisma.scheduleVersion.update({
        where: {
          id: versionId,
        },
        data: {
          status: "VALID",
        },
      });

    return {
      valid: true,
      validation,
      version: validatedVersion,
    };
  } catch (error) {
    /*
     * If validation itself crashes,
     * don't leave the version stuck in VALIDATING.
     */
    await prisma.scheduleVersion.update({
      where: {
        id: versionId,
      },
      data: {
        status: "DRAFT",
      },
    });

    throw error;
  }
};

export const approveScheduleVersion = async (
  versionId: string,
  approvedBy: string
) => {
  const version =
    await prisma.scheduleVersion.findUnique({
      where: {
        id: versionId,
      },
    });

  if (!version) {
    throw new Error("Schedule version not found");
  }

  if (version.status !== "VALID") {
    throw new Error(
      "Only a valid schedule version can be approved"
    );
  }

  return prisma.scheduleVersion.update({
    where: {
      id: versionId,
    },
    data: {
      status: "APPROVED",
      approvedBy,
    },
  });
};

export const publishScheduleVersion = async (
  versionId: string
) => {
  const version =
    await prisma.scheduleVersion.findUnique({
      where: {
        id: versionId,
      },
    });

  if (!version) {
    throw new Error("Schedule version not found");
  }

  if (version.status !== "APPROVED") {
    throw new Error(
      "Only an approved schedule version can be published"
    );
  }

  return prisma.scheduleVersion.update({
    where: {
      id: versionId,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};