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
  { name: 'UTC', value: 'UTC', offset: '+00:00', abbr: 'UTC', id: 'utc', flag: '🌐' },
  { name: 'London', value: 'city/London', offset: '+00:00', abbr: 'BST', id: 'london', flag: '🇬🇧' },
  
  // UTC+01:00
  { name: 'Paris', value: 'city/Paris', offset: '+01:00', abbr: 'CEST', id: 'paris', flag: '🇫🇷' },
  { name: 'Monaco', value: 'city/Monaco', offset: '+01:00', abbr: 'CEST', id: 'monaco', flag: '🇲🇨' },
  { name: 'Barcelona', value: 'city/Barcelona', offset: '+01:00', abbr: 'CEST', id: 'barcelona', flag: '🇪🇸' },
  { name: 'Amsterdam', value: 'city/Amsterdam', offset: '+01:00', abbr: 'CEST', id: 'amsterdam', flag: '🇳🇱' },
  { name: 'Berlin', value: 'city/Berlin', offset: '+01:00', abbr: 'CEST', id: 'berlin', flag: '🇩🇪' },
  { name: 'Zurich', value: 'city/Zurich', offset: '+01:00', abbr: 'CEST', id: 'zurich', flag: '🇨🇭' },
  { name: 'Geneva', value: 'city/Geneva', offset: '+01:00', abbr: 'CEST', id: 'geneva', flag: '🇨🇭' },
  { name: 'Oslo', value: 'city/Oslo', offset: '+01:00', abbr: 'CEST', id: 'oslo', flag: '🇳🇴' },
  { name: 'Stockholm', value: 'city/Stockholm', offset: '+01:00', abbr: 'CEST', id: 'stockholm', flag: '🇸🇪' },
  { name: 'Budapest', value: 'city/Budapest', offset: '+01:00', abbr: 'CEST', id: 'budapest', flag: '🇭🇺' },
  { name: 'Spa', value: 'city/Spa', offset: '+01:00', abbr: 'CEST', id: 'spa', flag: '🇧🇪' },
  { name: 'Monza', value: 'city/Monza', offset: '+01:00', abbr: 'CEST', id: 'monza', flag: '🇮🇹' },
  
  // UTC+02:00
  { name: 'Helsinki', value: 'city/Helsinki', offset: '+02:00', abbr: 'EEST', id: 'helsinki', flag: '🇫🇮' },
  
  // UTC+03:00
  { name: 'Moscow', value: 'city/Moscow', offset: '+03:00', abbr: 'MSK', id: 'moscow', flag: '🇷🇺' },
  
  // UTC+04:00
  { name: 'Baku', value: 'city/Baku', offset: '+04:00', abbr: 'AZT', id: 'baku', flag: '🇦🇿' },
  { name: 'Dubai', value: 'city/Dubai', offset: '+04:00', abbr: 'GST', id: 'dubai', flag: '🇦🇪' },
  
  // UTC+08:00
  { name: 'Shanghai', value: 'city/Shanghai', offset: '+08:00', abbr: 'CST', id: 'shanghai', flag: '🇨🇳' },
  { name: 'Hong Kong', value: 'city/Hong_Kong', offset: '+08:00', abbr: 'HKT', id: 'hongkong', flag: '🇭🇰' },
  { name: 'Taipei', value: 'city/Taipei', offset: '+08:00', abbr: 'CST', id: 'taipei', flag: '🇹🇼' },
  { name: 'Singapore', value: 'city/Singapore', offset: '+08:00', abbr: 'SGT', id: 'singapore', flag: '🇸🇬' },
  
  // UTC+09:00
  { name: 'Seoul', value: 'city/Seoul', offset: '+09:00', abbr: 'KST', id: 'seoul', flag: '🇰🇷' },
  { name: 'Pyongyang', value: 'city/Pyongyang', offset: '+09:00', abbr: 'KST', id: 'pyongyang', flag: '🇰🇵' },
  { name: 'Tokyo', value: 'city/Tokyo', offset: '+09:00', abbr: 'JST', id: 'tokyo', flag: '🇯🇵' },
  
  // UTC+10:00
  { name: 'Melbourne', value: 'city/Melbourne', offset: '+10:00', abbr: 'AEST', id: 'melbourne', flag: '🇦🇺' },
  
  // UTC+12:00
  { name: 'Auckland', value: 'city/Auckland', offset: '+12:00', abbr: 'NZST', id: 'auckland', flag: '🇳🇿' },
  
  // UTC-03:00
  { name: 'Sao Paulo', value: 'city/Sao_Paulo', offset: '-03:00', abbr: 'BRT', id: 'saopaulo', flag: '🇧🇷' },
  
  // UTC-05:00
  { name: 'New York', value: 'city/New_York', offset: '-05:00', abbr: 'EDT', id: 'nyc', flag: '🇺🇸' },
  { name: 'Miami', value: 'city/Miami', offset: '-05:00', abbr: 'EDT', id: 'miami', flag: '🇺🇸' },
  { name: 'Toronto', value: 'city/Toronto', offset: '-05:00', abbr: 'EDT', id: 'toronto', flag: '🇨🇦' },
  
  // UTC-06:00
  { name: 'Austin', value: 'city/Austin', offset: '-06:00', abbr: 'CDT', id: 'austin', flag: '🇺🇸' },
  { name: 'Mexico City', value: 'city/Mexico_City', offset: '-06:00', abbr: 'CST', id: 'mexico', flag: '🇲🇽' },
  
  // UTC-07:00
  { name: 'Las Vegas', value: 'city/Las_Vegas', offset: '-07:00', abbr: 'MST', id: 'vegas', flag: '🇺🇸' },
  
  // UTC-08:00
  { name: 'Los Angeles', value: 'city/Los_Angeles', offset: '-08:00', abbr: 'PDT', id: 'la', flag: '🇺🇸' },
  { name: 'San Francisco', value: 'city/San_Francisco', offset: '-08:00', abbr: 'PDT', id: 'sf', flag: '🇺🇸' },
  { name: 'Vancouver', value: 'city/Vancouver', offset: '-08:00', abbr: 'PDT', id: 'vancouver', flag: '🇨🇦' },
];

// Helper function to convert IANA timezone to our city format
export function convertIANAToCity(ianaTimezone: string): string {
  // Extract the city name from IANA timezone (e.g., "Asia/Shanghai" -> "Shanghai")
  const cityName = ianaTimezone.split('/').pop()?.replace('_', ' ');
  if (!cityName) return 'UTC';

  // Find the matching city timezone in our list
  const cityTimezone = timezones.find(tz => 
    tz.name.toLowerCase() === cityName.toLowerCase()
  );

  return cityTimezone ? cityTimezone.value : 'UTC';
}

// Map city timezones to IANA timezones
const cityToIANAMap: { [key: string]: string } = {
  'city/London': 'Europe/London',
  'city/Paris': 'Europe/Paris',
  'city/Monaco': 'Europe/Monaco',
  'city/Barcelona': 'Europe/Madrid',
  'city/Amsterdam': 'Europe/Amsterdam',
  'city/Berlin': 'Europe/Berlin',
  'city/Zurich': 'Europe/Zurich',
  'city/Geneva': 'Europe/Zurich',
  'city/Oslo': 'Europe/Oslo',
  'city/Stockholm': 'Europe/Stockholm',
  'city/Budapest': 'Europe/Budapest',
  'city/Spa': 'Europe/Brussels',
  'city/Monza': 'Europe/Rome',
  'city/Helsinki': 'Europe/Helsinki',
  'city/Moscow': 'Europe/Moscow',
  'city/Baku': 'Asia/Baku',
  'city/Dubai': 'Asia/Dubai',
  'city/Shanghai': 'Asia/Shanghai',
  'city/Hong_Kong': 'Asia/Hong_Kong',
  'city/Taipei': 'Asia/Taipei',
  'city/Singapore': 'Asia/Singapore',
  'city/Seoul': 'Asia/Seoul',
  'city/Pyongyang': 'Asia/Pyongyang',
  'city/Tokyo': 'Asia/Tokyo',
  'city/Melbourne': 'Australia/Melbourne',
  'city/Auckland': 'Pacific/Auckland',
  'city/Sao_Paulo': 'America/Sao_Paulo',
  'city/New_York': 'America/New_York',
  'city/Miami': 'America/New_York',
  'city/Toronto': 'America/Toronto',
  'city/Austin': 'America/Chicago',
  'city/Mexico_City': 'America/Mexico_City',
  'city/Las_Vegas': 'America/Phoenix',
  'city/Los_Angeles': 'America/Los_Angeles',
  'city/San_Francisco': 'America/Los_Angeles',
  'city/Vancouver': 'America/Vancouver',
};

// Convert time between different time zones
export function convertTime(
  time: string, 
  date: string, 
  fromTimezone: string, 
  toTimezone: string
): { time: string; date: string } {
  // Convert city timezones to IANA timezones
  const fromIANA = fromTimezone.startsWith('city/') ? cityToIANAMap[fromTimezone] : fromTimezone;
  const toIANA = toTimezone.startsWith('city/') ? cityToIANAMap[toTimezone] : toTimezone;
  
  if (!fromIANA || !toIANA) {
    console.error("Invalid timezone:", !fromIANA ? fromTimezone : toTimezone);
    return { time, date };
  }

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
    const sourceTimeStr = formatInTimeZone(sourceDate, fromIANA, 'yyyy-MM-dd\'T\'HH:mm:ssXXX');
    
    // Parse that string which now has the timezone offset correctly applied
    const sourceWithTZ = new Date(sourceTimeStr);
    
    // Format in target timezone
    return {
      time: formatInTimeZone(sourceWithTZ, toIANA, TIME_FORMAT),
      date: formatInTimeZone(sourceWithTZ, toIANA, DATE_FORMAT)
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
    // Get current time in the team member's timezone
    const { time, date } = getCurrentTimeInTimezone(member.timeZone);
    
    // Parse the current time and working hours in the member's timezone
    const now = parseISO(`${date}T${time}`);
    
    // Parse the working hours in the local timezone
    const todayStr = formatInTimeZone(new Date(), member.timeZone, 'yyyy-MM-dd');
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
