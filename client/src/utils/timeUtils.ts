import { format, addHours, parse, formatISO, parseISO, isWithinInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { TimeSlot, TeamMember, TeamMemberWithLocalTime } from '../types';

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'yyyy.MM.dd';
const HOUR_FORMAT = 'HH:mm';

// Note: Time zone offsets may change due to daylight saving time (summer/winter time).
// The offsets shown here are general references. The actual offset will be calculated
// based on the current date and the time zone's daylight saving time rules.
export const timezones = [
  // UTC+00:00
  { name: 'UTC', value: 'UTC', offset: '+00:00', abbr: 'UTC', id: 'utc' },
  { name: 'London (UTC+00:00)', value: 'Europe/London', offset: '+00:00', abbr: 'BST', id: 'london' },
  
  // UTC+01:00
  { name: 'Paris (UTC+01:00)', value: 'Europe/Paris', offset: '+01:00', abbr: 'CEST', id: 'paris' },
  { name: 'Monaco (UTC+01:00)', value: 'Europe/Monaco', offset: '+01:00', abbr: 'CEST', id: 'monaco' },
  { name: 'Barcelona (UTC+01:00)', value: 'Europe/Madrid', offset: '+01:00', abbr: 'CEST', id: 'barcelona' },
  { name: 'Amsterdam (UTC+01:00)', value: 'Europe/Amsterdam', offset: '+01:00', abbr: 'CEST', id: 'amsterdam' },
  { name: 'Berlin (UTC+01:00)', value: 'Europe/Berlin', offset: '+01:00', abbr: 'CEST', id: 'berlin' },
  { name: 'Zurich (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CEST', id: 'zurich' },
  { name: 'Geneva (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CEST', id: 'geneva' },
  { name: 'Oslo (UTC+01:00)', value: 'Europe/Oslo', offset: '+01:00', abbr: 'CEST', id: 'oslo' },
  { name: 'Stockholm (UTC+01:00)', value: 'Europe/Stockholm', offset: '+01:00', abbr: 'CEST', id: 'stockholm' },
  { name: 'Budapest (UTC+01:00)', value: 'Europe/Budapest', offset: '+01:00', abbr: 'CEST', id: 'budapest' },
  { name: 'Spa (UTC+01:00)', value: 'Europe/Brussels', offset: '+01:00', abbr: 'CEST', id: 'spa' },
  { name: 'Monza (UTC+01:00)', value: 'Europe/Rome', offset: '+01:00', abbr: 'CEST', id: 'monza' },
  
  // UTC+02:00
  { name: 'Helsinki (UTC+02:00)', value: 'Europe/Helsinki', offset: '+02:00', abbr: 'EEST', id: 'helsinki' },
  
  // UTC+03:00
  { name: 'Moscow (UTC+03:00)', value: 'Europe/Moscow', offset: '+03:00', abbr: 'MSK', id: 'moscow' },
  
  // UTC+04:00
  { name: 'Baku (UTC+04:00)', value: 'Asia/Baku', offset: '+04:00', abbr: 'AZT', id: 'baku' },
  { name: 'Dubai (UTC+04:00)', value: 'Asia/Dubai', offset: '+04:00', abbr: 'GST', id: 'dubai' },
  
  // UTC+08:00
  { name: 'Shanghai (UTC+08:00)', value: 'Asia/Shanghai', offset: '+08:00', abbr: 'CST', id: 'shanghai' },
  { name: 'Hong Kong (UTC+08:00)', value: 'Asia/Hong_Kong', offset: '+08:00', abbr: 'HKT', id: 'hongkong' },
  { name: 'Taipei (UTC+08:00)', value: 'Asia/Taipei', offset: '+08:00', abbr: 'CST', id: 'taipei' },
  { name: 'Singapore (UTC+08:00)', value: 'Asia/Singapore', offset: '+08:00', abbr: 'SGT', id: 'singapore' },
  
  // UTC+09:00
  { name: 'Seoul (UTC+09:00)', value: 'Asia/Seoul', offset: '+09:00', abbr: 'KST', id: 'seoul' },
  { name: 'Pyongyang (UTC+09:00)', value: 'Asia/Pyongyang', offset: '+09:00', abbr: 'KST', id: 'pyongyang' },
  { name: 'Tokyo (UTC+09:00)', value: 'Asia/Tokyo', offset: '+09:00', abbr: 'JST', id: 'tokyo' },
  
  // UTC+10:00
  { name: 'Melbourne (UTC+10:00)', value: 'Australia/Melbourne', offset: '+10:00', abbr: 'AEST', id: 'melbourne' },
  
  // UTC+12:00
  { name: 'Auckland (UTC+12:00)', value: 'Pacific/Auckland', offset: '+12:00', abbr: 'NZST', id: 'auckland' },
  
  // UTC-03:00
  { name: 'Sao Paulo (UTC-03:00)', value: 'America/Sao_Paulo', offset: '-03:00', abbr: 'BRT', id: 'saopaulo' },
  
  // UTC-05:00
  { name: 'New York (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EDT', id: 'nyc' },
  { name: 'Miami (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EDT', id: 'miami' },
  { name: 'Toronto (UTC-05:00)', value: 'America/Toronto', offset: '-05:00', abbr: 'EDT', id: 'toronto' },
  
  // UTC-06:00
  { name: 'Austin (UTC-06:00)', value: 'America/Chicago', offset: '-06:00', abbr: 'CDT', id: 'austin' },
  { name: 'Mexico City (UTC-06:00)', value: 'America/Mexico_City', offset: '-06:00', abbr: 'CST', id: 'mexico' },
  
  // UTC-07:00
  { name: 'Las Vegas (UTC-07:00)', value: 'America/Los_Angeles', offset: '-07:00', abbr: 'PDT', id: 'vegas' },
  
  // UTC-08:00
  { name: 'Los Angeles (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PDT', id: 'la' },
  { name: 'San Francisco (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PDT', id: 'sf' },
  { name: 'Vancouver (UTC-08:00)', value: 'America/Vancouver', offset: '-08:00', abbr: 'PDT', id: 'vancouver' },
];

// Convert time between different time zones
// This function handles daylight saving time transitions automatically 
// by using the IANA timezone database via date-fns-tz
export function convertTime(
  time: string, 
  date: string, 
  fromTimezone: string, 
  toTimezone: string
): { time: string; date: string } {
  // Parse the input time and date
  try {
    let hour = 0;
    let minute = 0;
    
    // Handle different time formats
    if (time.includes('AM') || time.includes('PM')) {
      // Handle 12-hour format like "9:00 AM"
      const matches = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (matches) {
        hour = parseInt(matches[1]);
        minute = parseInt(matches[2]);
        const period = matches[3].toUpperCase();
        
        // Adjust hour for PM
        if (period === 'PM' && hour < 12) {
          hour += 12;
        }
        // Adjust midnight
        if (period === 'AM' && hour === 12) {
          hour = 0;
        }
      }
    } else {
      // Handle 24-hour format like "9:00"
      const parts = time.split(':');
      hour = parseInt(parts[0]);
      minute = parts.length > 1 ? parseInt(parts[1]) : 0;
    }
    
    // Parse the date
    const [year, month, day] = date.split('-').map(num => parseInt(num));
    
    // Create a source date in UTC (to avoid any local timezone interference)
    const sourceDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    
    // Format in source timezone first to handle DST correctly
    const sourceTimeStr = formatInTimeZone(sourceDate, fromTimezone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX');
    
    // Parse that string which now has the timezone offset correctly applied
    const sourceWithTZ = new Date(sourceTimeStr);
    
    // Format in target timezone
    return {
      time: formatInTimeZone(sourceWithTZ, toTimezone, TIME_FORMAT),
      date: formatInTimeZone(sourceWithTZ, toTimezone, DATE_FORMAT)
    };
  } catch (error) {
    console.error("Error converting time:", error, { time, date, fromTimezone, toTimezone });
    
    // Return fallback values
    return {
      time: time,
      date: date
    };
  }
}

// Get current time in a specific timezone
// This function properly handles daylight saving time transitions automatically
// as it uses date-fns-tz which respects the timezone's DST rules
export function getCurrentTimeInTimezone(timezone: string): { time: string; date: string } {
  const now = new Date();
  
  return {
    time: formatInTimeZone(now, timezone, TIME_FORMAT),
    date: formatInTimeZone(now, timezone, DATE_FORMAT),
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
  workingHoursEnd: string
): boolean {
  // Parse the times into Date objects for comparison
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  const timeDate = parse(time, 'HH:mm', baseDate);
  const startDate = parse(workingHoursStart, 'HH:mm', baseDate);
  const endDate = parse(workingHoursEnd, 'HH:mm', baseDate);
  
  return isWithinInterval(timeDate, { start: startDate, end: endDate });
}

// Add local time information to team members
export function addLocalTimeToTeamMembers(
  teamMembers: TeamMember[],
  referenceDate: string = new Date().toISOString().split('T')[0]
): TeamMemberWithLocalTime[] {
  return teamMembers.map(member => {
    const { time, date } = getCurrentTimeInTimezone(member.timeZone);
    const currentHour = new Date().getHours();
    const workStart = parseInt(member.workingHoursStart.split(':')[0]);
    const workEnd = parseInt(member.workingHoursEnd.split(':')[0]);
    
    const isWorkingHours = currentHour >= workStart && currentHour < workEnd;
    
    return {
      ...member,
      localTime: time,
      localDate: date,
      isWorkingHours
    };
  });
}

// Format date for display
export function formatDate(date: string): string {
  return format(parseISO(date), 'EEEE, MMMM d, yyyy');
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
  const { title, date, startTime, endTime, timezone, description = '' } = meeting;
  
  // Format date and times for Google Calendar
  const startDateTime = formatISO(parseISO(`${date}T${startTime}`));
  const endDateTime = formatISO(parseISO(`${date}T${endTime}`));
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', title);
  url.searchParams.append('dates', `${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`);
  url.searchParams.append('details', description);
  url.searchParams.append('ctz', timezone);
  
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
  const { title, date, startTime, endTime, timezone, description = '' } = meeting;
  
  // Format date and times for iCalendar format
  const startDateTime = formatISO(parseISO(`${date}T${startTime}`));
  const endDateTime = formatISO(parseISO(`${date}T${endTime}`));
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${startDateTime.replace(/[-:]/g, '')}
DTEND:${endDateTime.replace(/[-:]/g, '')}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

// Helper function to format time for display in 12-hour format
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
