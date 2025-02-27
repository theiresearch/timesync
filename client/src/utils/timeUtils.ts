import { format, addHours, parse, formatISO, parseISO, isWithinInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { TimeSlot, TeamMember, TeamMemberWithLocalTime } from '../types';

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'yyyy.MM.dd';
const HOUR_FORMAT = 'HH:mm';

export const timezones = [
  // UTC-08:00
  { name: 'Los Angeles (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PDT' },
  { name: 'San Francisco (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PDT' },
  { name: 'Vancouver (UTC-08:00)', value: 'America/Vancouver', offset: '-08:00', abbr: 'PDT' },
  // UTC-07:00
  { name: 'Las Vegas (UTC-07:00)', value: 'America/Los_Angeles', offset: '-07:00', abbr: 'PDT' },
  // UTC-06:00
  { name: 'Austin (UTC-06:00)', value: 'America/Chicago', offset: '-06:00', abbr: 'CDT' },
  { name: 'Mexico City (UTC-06:00)', value: 'America/Mexico_City', offset: '-06:00', abbr: 'CST' },
  // UTC-05:00
  { name: 'New York (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EDT' },
  { name: 'Miami (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EDT' },
  { name: 'Toronto (UTC-05:00)', value: 'America/Toronto', offset: '-05:00', abbr: 'EDT' },
  // UTC-03:00
  { name: 'Sao Paulo (UTC-03:00)', value: 'America/Sao_Paulo', offset: '-03:00', abbr: 'BRT' },
  // UTC+00:00
  { name: 'UTC', value: 'UTC', offset: '+00:00', abbr: 'UTC' },
  { name: 'London (UTC+00:00)', value: 'Europe/London', offset: '+00:00', abbr: 'BST' },
  // UTC+01:00
  { name: 'Paris (UTC+01:00)', value: 'Europe/Paris', offset: '+01:00', abbr: 'CEST' },
  { name: 'Monaco (UTC+01:00)', value: 'Europe/Monaco', offset: '+01:00', abbr: 'CEST' },
  { name: 'Barcelona (UTC+01:00)', value: 'Europe/Madrid', offset: '+01:00', abbr: 'CEST' },
  { name: 'Amsterdam (UTC+01:00)', value: 'Europe/Amsterdam', offset: '+01:00', abbr: 'CEST' },
  { name: 'Berlin (UTC+01:00)', value: 'Europe/Berlin', offset: '+01:00', abbr: 'CEST' },
  { name: 'Zurich (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CEST' },
  { name: 'Geneva (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CEST' },
  { name: 'Oslo (UTC+01:00)', value: 'Europe/Oslo', offset: '+01:00', abbr: 'CEST' },
  { name: 'Stockholm (UTC+01:00)', value: 'Europe/Stockholm', offset: '+01:00', abbr: 'CEST' },
  { name: 'Budapest (UTC+01:00)', value: 'Europe/Budapest', offset: '+01:00', abbr: 'CEST' },
  { name: 'Spa (UTC+01:00)', value: 'Europe/Brussels', offset: '+01:00', abbr: 'CEST' },
  { name: 'Monza (UTC+01:00)', value: 'Europe/Rome', offset: '+01:00', abbr: 'CEST' },
  // UTC+02:00
  { name: 'Helsinki (UTC+02:00)', value: 'Europe/Helsinki', offset: '+02:00', abbr: 'EEST' },
  // UTC+03:00
  { name: 'Moscow (UTC+03:00)', value: 'Europe/Moscow', offset: '+03:00', abbr: 'MSK' },
  // UTC+04:00
  { name: 'Baku (UTC+04:00)', value: 'Asia/Baku', offset: '+04:00', abbr: 'AZT' },
  { name: 'Dubai (UTC+04:00)', value: 'Asia/Dubai', offset: '+04:00', abbr: 'GST' },
  // UTC+08:00
  { name: 'Shanghai (UTC+08:00)', value: 'Asia/Shanghai', offset: '+08:00', abbr: 'CST' },
  { name: 'Hong Kong (UTC+08:00)', value: 'Asia/Hong_Kong', offset: '+08:00', abbr: 'HKT' },
  { name: 'Taipei (UTC+08:00)', value: 'Asia/Taipei', offset: '+08:00', abbr: 'CST' },
  { name: 'Singapore (UTC+08:00)', value: 'Asia/Singapore', offset: '+08:00', abbr: 'SGT' },
  // UTC+09:00
  { name: 'Seoul (UTC+09:00)', value: 'Asia/Seoul', offset: '+09:00', abbr: 'KST' },
  { name: 'Pyongyang (UTC+09:00)', value: 'Asia/Pyongyang', offset: '+09:00', abbr: 'KST' },
  { name: 'Tokyo (UTC+09:00)', value: 'Asia/Tokyo', offset: '+09:00', abbr: 'JST' },
  // UTC+10:00
  { name: 'Melbourne (UTC+10:00)', value: 'Australia/Melbourne', offset: '+10:00', abbr: 'AEST' },
  // UTC+12:00
  { name: 'Auckland (UTC+12:00)', value: 'Pacific/Auckland', offset: '+12:00', abbr: 'NZST' },
];

// Convert time between different time zones
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
    
    // Create date object for the specified date and time
    const dateObj = new Date(date);
    dateObj.setHours(hour, minute, 0, 0);
    
    // Format in target timezone
    return {
      time: formatInTimeZone(dateObj, toTimezone, TIME_FORMAT),
      date: formatInTimeZone(dateObj, toTimezone, DATE_FORMAT)
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
