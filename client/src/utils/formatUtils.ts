import { TeamMemberWithLocalTime } from '../types';

// Country flags emoji map
const countryToFlagEmoji: Record<string, string> = {
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'Japan': '🇯🇵',
  'Australia': '🇦🇺',
  'Canada': '🇨🇦',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Brazil': '🇧🇷',
  'Russia': '🇷🇺',
  'Mexico': '🇲🇽',
  'South Korea': '🇰🇷',
  'Singapore': '🇸🇬',
  'New Zealand': '🇳🇿',
  'Ireland': '🇮🇪',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Netherlands': '🇳🇱',
  'Switzerland': '🇨🇭',
  'South Africa': '🇿🇦',
};

// Get country flag emoji
export const getCountryFlag = (country: string): string => {
  return countryToFlagEmoji[country] || '🌍';
};

// Time zone abbreviation map
const timezoneToAbbr: Record<string, string> = {
  'America/New_York': 'EDT',
  'America/Chicago': 'CDT',
  'America/Denver': 'MDT',
  'America/Los_Angeles': 'PDT',
  'America/Anchorage': 'AKDT',
  'America/Phoenix': 'MST',
  'America/Honolulu': 'HST',
  'Europe/London': 'BST',
  'Europe/Paris': 'CEST',
  'Europe/Berlin': 'CEST',
  'Europe/Rome': 'CEST',
  'Europe/Madrid': 'CEST',
  'Asia/Tokyo': 'JST',
  'Asia/Shanghai': 'CST',
  'Asia/Seoul': 'KST',
  'Asia/Singapore': 'SGT',
  'Asia/Kolkata': 'IST',
  'Australia/Sydney': 'AEST',
  'Australia/Melbourne': 'AEST',
  'Australia/Perth': 'AWST',
  'Pacific/Auckland': 'NZST',
};

// Get time zone abbreviation
export const getTimezoneAbbr = (timezone: string): string => {
  return timezoneToAbbr[timezone] || timezone.split('/').pop() || timezone;
};

// Get readable time zone name
export const getReadableTimezoneName = (timezone: string): string => {
  const lastPart = timezone.split('/').pop();
  if (!lastPart) return timezone;
  
  return lastPart
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

// Generate meeting proposal text
export function generateMeetingProposal(
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  teamMembers: TeamMemberWithLocalTime[],
  referenceTimezone: string
): string {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let proposal = `${title}\n\nHi team,\n\nI'm proposing we have ${title} on ${formattedDate}. Here are the times for each team member:\n\n`;

  // Add time for each team member
  teamMembers.forEach(member => {
    const tzAbbr = getTimezoneAbbr(member.timeZone);
    const dateInfo = member.localDate !== formattedDate ? ` (${member.localDate})` : '';
    proposal += `${member.flag} ${member.name} (${getReadableTimezoneName(member.timeZone)}): ${member.localTime} - ${endTime} ${tzAbbr}${dateInfo}\n`;
  });

  proposal += `\nPlease let me know if this time works for everyone.\n\nBest regards,\n[Your Name]`;

  return proposal;
}

// Format working hours display
export function formatWorkingHours(start: string, end: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Copy text to clipboard
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea invisible
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        resolve(successful);
      } catch (err) {
        resolve(false);
      }
      
      document.body.removeChild(textArea);
    }
  });
}
