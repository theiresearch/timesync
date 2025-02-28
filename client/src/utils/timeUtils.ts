import {
  format,
  addHours,
  parse,
  formatISO,
  parseISO,
  isWithinInterval,
  getMonth,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { TimeSlot, TeamMember, TeamMemberWithLocalTime } from "../types";

const TIME_FORMAT = "HH:mm";
const DATE_FORMAT = "yyyy.MM.dd";
const HOUR_FORMAT = "HH:mm";

// Note: Time zone offsets may change due to daylight saving time (summer/winter time).
// The offsets shown here are general references. The actual offset will be calculated
// based on the current date and the time zone's daylight saving time rules.
export const timezones = [
  // UTC+00:00
  { name: "UTC", value: "UTC", offset: "+00:00", abbr: "UTC", id: "utc-0" },
  {
    name: "London",
    value: "Europe/London",
    offset: "+00:00",
    abbr: "GMT/BST",
    id: "london-0",
  },

  // UTC Positive Offsets (East of Greenwich) - ordered east to west (largest offset to smallest)
  // UTC+10:00 (eastmost)
  {
    name: "Melbourne",
    value: "Australia/Melbourne",
    offset: "+10:00",
    abbr: "AEST/AEDT",
    id: "melbourne-10",
  },

  // UTC+09:00
  {
    name: "Tokyo",
    value: "Asia/Tokyo",
    offset: "+09:00",
    abbr: "JST",
    id: "tokyo-9",
  },

  // UTC+08:00
  {
    name: "Shanghai",
    value: "Asia/Shanghai",
    offset: "+08:00",
    abbr: "CST",
    id: "shanghai-8",
  },
  {
    name: "Hong Kong",
    value: "Asia/Hong_Kong",
    offset: "+08:00",
    abbr: "HKT",
    id: "hongkong-8",
  },
  {
    name: "Singapore",
    value: "Asia/Singapore",
    offset: "+08:00",
    abbr: "SGT",
    id: "singapore-8",
  },

  // UTC+04:00
  {
    name: "Dubai",
    value: "Asia/Dubai",
    offset: "+04:00",
    abbr: "GST",
    id: "dubai-4",
  },

  // UTC+01:00 (westmost of the positive offsets)
  {
    name: "Paris",
    value: "Europe/Paris",
    ianaTimezone: "Europe/Paris",
    offset: "+01:00",
    abbr: "CET/CEST",
    id: "paris-1",
  },
  {
    name: "Zurich",
    value: "Europe/Zurich",
    ianaTimezone: "Europe/Zurich",
    offset: "+01:00",
    abbr: "CET/CEST",
    id: "zurich-1",
  },

  // UTC Negative Offsets (West of Greenwich) - ordered west to east
  // UTC-08:00 (westmost)
  {
    name: "San Francisco",
    value: "City/San_Francisco",
    ianaTimezone: "America/Los_Angeles",
    offset: "-08:00",
    abbr: "PST/PDT",
    id: "sf-n8",
  },

  // UTC-06:00
  {
    name: "Austin",
    value: "America/Chicago",
    offset: "-06:00",
    abbr: "CST/CDT",
    id: "austin-n6",
  },

  // UTC-05:00 (eastmost of the negative offsets)
  {
    name: "New York",
    value: "America/New_York",
    ianaTimezone: "America/New_York",
    offset: "-05:00",
    abbr: "EST/EDT",
    id: "nyc-n5",
  },
];

// Convert time between different time zones
// This function handles daylight saving time transitions automatically
// by using the IANA timezone database via date-fns-tz
export function convertTime(
  time: string,
  date: string,
  fromTimezone: string,
  toTimezone: string,
): { time: string; date: string } {
  try {
    // Find the timezone objects to check if they have an ianaTimezone property
    const fromTimezoneObj = timezones.find((tz) => tz.value === fromTimezone);
    const toTimezoneObj = timezones.find((tz) => tz.value === toTimezone);

    const actualFromTimezone = fromTimezoneObj?.ianaTimezone || fromTimezone;
    const actualToTimezone = toTimezoneObj?.ianaTimezone || toTimezone;

    // If source and target timezones are exactly the same, return the original time
    if (actualFromTimezone === actualToTimezone) {
      return {
        time,
        date: date.replace(/\./g, "-"), // Ensure consistent date format
      };
    }

    // Parse time components
    let hour = 0;
    let minute = 0;

    if (time.includes("AM") || time.includes("PM")) {
      const matches = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (matches) {
        hour = parseInt(matches[1]);
        minute = parseInt(matches[2]);
        const period = matches[3].toUpperCase();

        if (period === "PM" && hour < 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
      }
    } else {
      const [h, m] = time.split(":");
      hour = parseInt(h);
      minute = parseInt(m);
    }

    // Parse date and ensure proper formatting
    const formattedDate = date.replace(/\./g, "-");
    const [year, month, day] = formattedDate
      .split("-")
      .map((num) => parseInt(num));

    // Create a date in UTC, then adjust for source timezone
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

    // Get the offset of the source timezone at this time
    const sourceOffset = formatInTimeZone(utcDate, actualFromTimezone, "xxx");
    const sourceOffsetHours = parseInt(sourceOffset.slice(0, 3));
    const sourceOffsetMinutes = parseInt(sourceOffset.slice(3)) || 0;

    // Adjust UTC time to account for source timezone
    const adjustedUtcDate = new Date(
      utcDate.getTime() -
        (sourceOffsetHours * 60 + sourceOffsetMinutes) * 60 * 1000,
    );

    // Format in target timezone
    const targetDate = formatInTimeZone(
      adjustedUtcDate,
      actualToTimezone,
      DATE_FORMAT,
    );
    const targetTime = formatInTimeZone(
      adjustedUtcDate,
      actualToTimezone,
      TIME_FORMAT,
    );

    return {
      time: targetTime,
      date: targetDate,
    };
  } catch (error) {
    console.error("Error converting time:", error, {
      time,
      date,
      fromTimezone,
      toTimezone,
    });
    return { time, date };
  }
}

// Get current time in a specific timezone
// This function properly handles daylight saving time transitions automatically
// as it uses date-fns-tz which respects the timezone's DST rules
export function getCurrentTimeInTimezone(timezone: string): {
  time: string;
  date: string;
} {
  const now = new Date();

  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find((tz) => tz.value === timezone);
  const actualTimezone = timezoneObj?.ianaTimezone || timezone;

  return {
    time: formatInTimeZone(now, actualTimezone, TIME_FORMAT),
    date: formatInTimeZone(now, actualTimezone, DATE_FORMAT),
  };
}

// Generate time slots for a day
export function generateTimeSlots(startHour = 0, endHour = 24): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let hour = startHour; hour < endHour; hour++) {
    const slotDate = addHours(baseDate, hour);
    slots.push({
      hour,
      minute: 0,
      formatted: format(slotDate, HOUR_FORMAT),
    });
  }

  return slots;
}

// Check if a time is within working hours
export function isWithinWorkingHours(
  time: string,
  workingHoursStart: string,
  workingHoursEnd: string,
): boolean {
  // Parse the times into Date objects for comparison
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const timeDate = parse(time, "HH:mm", baseDate);
  const startDate = parse(workingHoursStart, "HH:mm", baseDate);
  const endDate = parse(workingHoursEnd, "HH:mm", baseDate);

  return isWithinInterval(timeDate, { start: startDate, end: endDate });
}

// Add local time information to team members
export function addLocalTimeToTeamMembers(
  teamMembers: TeamMember[],
  referenceDate?: string,
): TeamMemberWithLocalTime[] {
  return teamMembers.map((member) => {
    // Get current time in the team member's timezone
    const { time, date } = getCurrentTimeInTimezone(member.timeZone);

    // Parse the current time and working hours in the member's timezone
    const now = parseISO(`${date}T${time}`);

    // Find the timezone object to check if it has an ianaTimezone property
    const timezoneObj = timezones.find((tz) => tz.value === member.timeZone);
    const actualTimezone = timezoneObj?.ianaTimezone || member.timeZone;

    // Parse the working hours in the local timezone
    const todayStr = formatInTimeZone(new Date(), actualTimezone, "yyyy.MM.dd");
    const workStart = parseISO(`${todayStr}T${member.workingHoursStart}`);
    const workEnd = parseISO(`${todayStr}T${member.workingHoursEnd}`);

    // Check if current time is within working hours
    const isWorkingHours = now >= workStart && now < workEnd;

    return {
      ...member,
      localTime: time,
      localDate: date,
      isWorkingHours,
    };
  });
}

// Format date for display
export function formatDate(date: string, formatStr: string = "EEEE, MMMM d, yyyy"): string {
  return format(parseISO(date), formatStr);
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(meeting: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
}): string {
  const {
    title,
    date,
    startTime,
    endTime,
    timezone,
    description = "",
  } = meeting;

  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find((tz) => tz.value === timezone);
  const actualTimezone = timezoneObj?.ianaTimezone || timezone;

  // Format date and times for Google Calendar
  const startDateTime = formatISO(parseISO(`${date}T${startTime}`));
  const endDateTime = formatISO(parseISO(`${date}T${endTime}`));

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", title);
  url.searchParams.append(
    "dates",
    `${startDateTime.replace(/[-:]/g, "")}/${endDateTime.replace(/[-:]/g, "")}`,
  );
  url.searchParams.append("details", description);
  url.searchParams.append("ctz", actualTimezone);

  return url.toString();
}

// Generate Apple Calendar URL (ics file)
export function generateAppleCalendarUrl(meeting: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
}): string {
  const {
    title,
    date,
    startTime,
    endTime,
    timezone,
    description = "",
  } = meeting;

  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find((tz) => tz.value === timezone);
  const actualTimezone = timezoneObj?.ianaTimezone || timezone;

  // Format date and times for iCalendar format
  const startDateTime = formatISO(parseISO(`${date}T${startTime}`));
  const endDateTime = formatISO(parseISO(`${date}T${endTime}`));

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${startDateTime.replace(/[-:]/g, "")}
DTEND:${endDateTime.replace(/[-:]/g, "")}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

// Helper function to format time for display in 12-hour format
export function formatTimeDisplay(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Get the actual UTC offset for a timezone, considering daylight saving time
export function getActualUtcOffset(timezone: string, referenceDate?: Date): string {
  try {
    // Use provided reference date or current date
    const dateToUse = referenceDate || new Date();
    
    // Find the timezone object to check if it has an ianaTimezone property
    const timezoneObj = timezones.find((tz) => tz.value === timezone);
    const actualTimezone = timezoneObj?.ianaTimezone || timezone;
    
    // Get the formatted date with timezone offset
    const formattedDate = formatInTimeZone(dateToUse, actualTimezone, 'XXX');
    
    // Convert 'Z' to '+00:00' for consistency
    return formattedDate === 'Z' ? '+00:00' : formattedDate;
  } catch (error) {
    console.error(`Error calculating offset for ${timezone}:`, error);
    return "+00:00"; // Default to UTC if there's an error
  }
}

// FOR TESTING ONLY: Get the UTC offset for a specific date
// This function is useful to check what the offset would be on different dates
// e.g., to see if a timezone has DST and when the changes occur
export function getUtcOffsetForDate(timezone: string, date: Date): string {
  try {
    const timezoneObj = timezones.find((tz) => tz.value === timezone);
    const actualTimezone = timezoneObj?.ianaTimezone || timezone;
    
    const formattedDate = formatInTimeZone(date, actualTimezone, 'XXX');
    return formattedDate === 'Z' ? '+00:00' : formattedDate;
  } catch (error) {
    console.error(`Error calculating offset for ${timezone} at date ${date}:`, error);
    return "+00:00";
  }
}
