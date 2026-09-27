import { prisma } from "../lib/prisma";

type ScheduleConfig = {
  date: Date;
  startTime: string;
  endTime: string;
};

const createDateTime = (
  date: Date,
  time: string
) => {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const result = new Date(date);

  result.setHours(hours, minutes, 0, 0);

  return result;
};

export const generateTimeSlots = async (
  tournamentId: string,
  config: ScheduleConfig
) => {
  const rule =
    await prisma.tournamentRule.findUnique({
      where: {
        tournamentId,
      },
    });

  if (!rule) {
    throw new Error(
      "Tournament scheduling rules are not configured"
    );
  }

  const venues = await prisma.venue.findMany({
    where: {
      tournamentId,
    },
    include: {
      courts: {
        where: {
          active: true,
        },
      },
    },
  });

  const courts = venues.flatMap(
    (venue) => venue.courts
  );

  if (courts.length === 0) {
    throw new Error(
      "No active courts are available"
    );
  }

  const matchDuration =
    rule.matchDurationMin ?? 30;

  const turnaround =
    rule.courtTurnaroundMin ?? 10;

  const slotDuration =
    matchDuration + turnaround;

  const dayStart = createDateTime(
    config.date,
    config.startTime
  );

  const dayEnd = createDateTime(
    config.date,
    config.endTime
  );

  if (dayStart >= dayEnd) {
    throw new Error(
      "Operating start time must be before end time"
    );
  }

  const slots = [];

  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const scheduledEnd = new Date(
      currentTime.getTime() +
        matchDuration * 60 * 1000
    );

    if (scheduledEnd > dayEnd) {
      break;
    }

    /*
     * TimeSlot is tournament-level.
     * Court assignment is stored on Match.courtId,
     * not on TimeSlot.
     *
     * We only need one slot for each time period.
     */
    const existingSlot =
      await prisma.timeSlot.findFirst({
        where: {
          tournamentId,
          scheduledStart: currentTime,
          scheduledEnd,
        },
      });

    if (!existingSlot) {
      const slot =
        await prisma.timeSlot.create({
          data: {
            tournamentId,
            scheduledStart: new Date(
              currentTime
            ),
            scheduledEnd,
          },
        });

      slots.push(slot);
    }

    currentTime = new Date(
      currentTime.getTime() +
        slotDuration * 60 * 1000
    );
  }

  return {
    tournamentId,
    date: config.date,
    courts: courts.length,
    matchDurationMinutes: matchDuration,
    turnaroundMinutes: turnaround,
    slotDurationMinutes: slotDuration,
    slotsCreated: slots.length,
    slots,
  };
};