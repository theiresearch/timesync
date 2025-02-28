import { format, addHours, parse, formatISO, parseISO, isWithinInterval } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { TimeSlot, TeamMember, TeamMemberWithLocalTime } from '../types';

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'yyyy.MM.dd';
const HOUR_FORMAT = 'HH:mm';

// Note: Time zone offsets may change due to daylight saving time (summer/winter time).
// The offsets shown here are general references. The actual offset will be calculated
// based on the current date and the time zone's daylight saving time rules.
export const timezones = [
  // UTC+00:00
  { name: 'UTC', value: 'UTC', offset: '+00:00', abbr: 'UTC', id: 'utc-0' },
  { name: 'London (UTC+00:00)', value: 'Europe/London', offset: '+00:00', abbr: 'GMT/BST', id: 'london-0' },
  
  // UTC Positive Offsets (East of Greenwich)
  // UTC+01:00
  { name: 'Paris (UTC+01:00)', value: 'Europe/Paris', offset: '+01:00', abbr: 'CET/CEST', id: 'paris-1' },
  { name: 'Monaco (UTC+01:00)', value: 'Europe/Monaco', offset: '+01:00', abbr: 'CET/CEST', id: 'monaco-1' },
  { name: 'Barcelona (UTC+01:00)', value: 'Europe/Madrid', offset: '+01:00', abbr: 'CET/CEST', id: 'barcelona-1' },
  { name: 'Amsterdam (UTC+01:00)', value: 'Europe/Amsterdam', offset: '+01:00', abbr: 'CET/CEST', id: 'amsterdam-1' },
  { name: 'Berlin (UTC+01:00)', value: 'Europe/Berlin', offset: '+01:00', abbr: 'CET/CEST', id: 'berlin-1' },
  { name: 'Zurich (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CET/CEST', id: 'zurich-1' },
  { name: 'Geneva (UTC+01:00)', value: 'Europe/Zurich', offset: '+01:00', abbr: 'CET/CEST', id: 'geneva-1' },
  { name: 'Oslo (UTC+01:00)', value: 'Europe/Oslo', offset: '+01:00', abbr: 'CET/CEST', id: 'oslo-1' },
  { name: 'Stockholm (UTC+01:00)', value: 'Europe/Stockholm', offset: '+01:00', abbr: 'CET/CEST', id: 'stockholm-1' },
  { name: 'Budapest (UTC+01:00)', value: 'Europe/Budapest', offset: '+01:00', abbr: 'CET/CEST', id: 'budapest-1' },
  { name: 'Spa (UTC+01:00)', value: 'Europe/Brussels', offset: '+01:00', abbr: 'CET/CEST', id: 'spa-1' },
  { name: 'Monza (UTC+01:00)', value: 'Europe/Rome', offset: '+01:00', abbr: 'CET/CEST', id: 'monza-1' },
  
  // UTC+02:00
  { name: 'Helsinki (UTC+02:00)', value: 'Europe/Helsinki', offset: '+02:00', abbr: 'EET/EEST', id: 'helsinki-2' },
  
  // UTC+03:00
  { name: 'Moscow (UTC+03:00)', value: 'Europe/Moscow', offset: '+03:00', abbr: 'MSK', id: 'moscow-3' },
  
  // UTC+04:00
  { name: 'Baku (UTC+04:00)', value: 'Asia/Baku', offset: '+04:00', abbr: 'AZT', id: 'baku-4' },
  { name: 'Dubai (UTC+04:00)', value: 'Asia/Dubai', offset: '+04:00', abbr: 'GST', id: 'dubai-4' },
  
  // UTC+08:00
  { name: 'Shanghai (UTC+08:00)', value: 'Asia/Shanghai', offset: '+08:00', abbr: 'CST', id: 'shanghai-8' },
  { name: 'Hong Kong (UTC+08:00)', value: 'Asia/Hong_Kong', offset: '+08:00', abbr: 'HKT', id: 'hongkong-8' },
  { name: 'Taipei (UTC+08:00)', value: 'Asia/Taipei', offset: '+08:00', abbr: 'CST', id: 'taipei-8' },
  { name: 'Singapore (UTC+08:00)', value: 'Asia/Singapore', offset: '+08:00', abbr: 'SGT', id: 'singapore-8' },
  
  // UTC+09:00
  { name: 'Seoul (UTC+09:00)', value: 'Asia/Seoul', offset: '+09:00', abbr: 'KST', id: 'seoul-9' },
  { name: 'Pyongyang (UTC+09:00)', value: 'Asia/Pyongyang', offset: '+09:00', abbr: 'KST', id: 'pyongyang-9' },
  { name: 'Tokyo (UTC+09:00)', value: 'Asia/Tokyo', offset: '+09:00', abbr: 'JST', id: 'tokyo-9' },
  
  // UTC+10:00
  { name: 'Melbourne (UTC+10:00)', value: 'Australia/Melbourne', offset: '+10:00', abbr: 'AEST/AEDT', id: 'melbourne-10' },
  
  // UTC+12:00
  { name: 'Auckland (UTC+12:00)', value: 'Pacific/Auckland', offset: '+12:00', abbr: 'NZST/NZDT', id: 'auckland-12' },
  
  // UTC Negative Offsets (West of Greenwich)
  // UTC-03:00
  { name: 'Sao Paulo (UTC-03:00)', value: 'America/Sao_Paulo', offset: '-03:00', abbr: 'BRT', id: 'saopaulo-n3' },
  
  // UTC-05:00
  { name: 'New York (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EST/EDT', id: 'nyc-n5' },
  { name: 'Miami (UTC-05:00)', value: 'America/New_York', offset: '-05:00', abbr: 'EST/EDT', id: 'miami-n5' },
  { name: 'Toronto (UTC-05:00)', value: 'America/Toronto', offset: '-05:00', abbr: 'EST/EDT', id: 'toronto-n5' },
  
  // UTC-06:00
  { name: 'Austin (UTC-06:00)', value: 'America/Chicago', offset: '-06:00', abbr: 'CST/CDT', id: 'austin-n6' },
  { name: 'Mexico City (UTC-06:00)', value: 'America/Mexico_City', offset: '-06:00', abbr: 'CST/CDT', id: 'mexico-n6' },
  
  // UTC-07:00
  { name: 'Las Vegas (UTC-07:00)', value: 'America/Phoenix', offset: '-07:00', abbr: 'MST', id: 'vegas-n7' },
  
  // UTC-08:00
  { name: 'Los Angeles (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PST/PDT', id: 'la-n8' },
  { name: 'San Francisco (UTC-08:00)', value: 'America/Los_Angeles', offset: '-08:00', abbr: 'PST/PDT', id: 'sf-n8' },
  { name: 'Vancouver (UTC-08:00)', value: 'America/Vancouver', offset: '-08:00', abbr: 'PST/PDT', id: 'vancouver-n8' },
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
    
    // Find the timezone objects to check if they have an ianaTimezone property
    const fromTimezoneObj = timezones.find(tz => tz.value === fromTimezone);
    const toTimezoneObj = timezones.find(tz => tz.value === toTimezone);
    
    const actualFromTimezone = fromTimezoneObj?.ianaTimezone || fromTimezone;
    const actualToTimezone = toTimezoneObj?.ianaTimezone || toTimezone;
    
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
    
    // FIXED APPROACH: Create a date that's properly interpreted in the source timezone
    // 1. Format the date and time as a string in ISO format
    const dateTimeStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    // 2. Create a date in the local timezone (browser's timezone)
    const localDate = new Date(dateTimeStr);
    
    // 3. Convert to the source timezone
    const sourceZonedDate = toZonedTime(localDate, actualFromTimezone);
    
    // 4. Convert from source timezone to target timezone
    const targetDate = formatInTimeZone(sourceZonedDate, actualToTimezone, DATE_FORMAT);
    const targetTime = formatInTimeZone(sourceZonedDate, actualToTimezone, TIME_FORMAT);
    
    return {
      time: targetTime,
      date: targetDate
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
  
  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find(tz => tz.value === timezone);
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
    // Get current time in the team member's timezone
    const { time, date } = getCurrentTimeInTimezone(member.timeZone);
    
    // Parse the current time and working hours in the member's timezone
    const now = parseISO(`${date}T${time}`);
    
    // Find the timezone object to check if it has an ianaTimezone property
    const timezoneObj = timezones.find(tz => tz.value === member.timeZone);
    const actualTimezone = timezoneObj?.ianaTimezone || member.timeZone;
    
    // Parse the working hours in the local timezone
    const todayStr = formatInTimeZone(new Date(), actualTimezone, 'yyyy-MM-dd');
    const workStart = parseISO(`${todayStr}T${member.workingHoursStart}`);
    const workEnd = parseISO(`${todayStr}T${member.workingHoursEnd}`);
    
    // Check if current time is within working hours
    const isWorkingHours = now >= workStart && now < workEnd;
    
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
  
  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find(tz => tz.value === timezone);
  const actualTimezone = timezoneObj?.ianaTimezone || timezone;
  
  // Format date and times for Google Calendar
  const startDateTime = formatISO(parseISO(`${date}T${startTime}`));
  const endDateTime = formatISO(parseISO(`${date}T${endTime}`));
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', title);
  url.searchParams.append('dates', `${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`);
  url.searchParams.append('details', description);
  url.searchParams.append('ctz', actualTimezone);
  
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
  
  // Find the timezone object to check if it has an ianaTimezone property
  const timezoneObj = timezones.find(tz => tz.value === timezone);
  const actualTimezone = timezoneObj?.ianaTimezone || timezone;
  
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
