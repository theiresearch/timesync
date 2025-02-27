import { format, addHours, parse, formatISO, parseISO, isWithinInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { TimeSlot, TeamMember, TeamMemberWithLocalTime } from '../types';

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'EEE, MMM d';
const HOUR_FORMAT = 'HH:mm';

export const timezones = [
  { name: 'US/Eastern (New York)', value: 'America/New_York', offset: '-05:00', abbr: 'EDT' },
  { name: 'US/Pacific (Los Angeles)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PDT' },
  { name: 'UK (London)', value: 'Europe/London', offset: '+00:00', abbr: 'BST' },
  { name: 'Europe/Paris', value: 'Europe/Paris', offset: '+01:00', abbr: 'CEST' },
  { name: 'Asia/Tokyo (Japan)', value: 'Asia/Tokyo', offset: '+09:00', abbr: 'JST' },
  { name: 'Australia/Sydney', value: 'Australia/Sydney', offset: '+10:00', abbr: 'AEST' },
  { name: 'Pacific/Auckland (New Zealand)', value: 'Pacific/Auckland', offset: '+12:00', abbr: 'NZST' },
  { name: 'Asia/Shanghai (China)', value: 'Asia/Shanghai', offset: '+08:00', abbr: 'CST' },
  { name: 'Asia/Kolkata (India)', value: 'Asia/Kolkata', offset: '+05:30', abbr: 'IST' },
  { name: 'Europe/Berlin (Germany)', value: 'Europe/Berlin', offset: '+01:00', abbr: 'CEST' },
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
