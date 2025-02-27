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
  'Hong Kong': '🇭🇰',
  'Taiwan': '🇹🇼',
  'Brazil': '🇧🇷',
  'Russia': '🇷🇺',
  'Mexico': '🇲🇽',
  'South Korea': '🇰🇷',
  'North Korea': '🇰🇵',
  'Singapore': '🇸🇬',
  'New Zealand': '🇳🇿',
  'Ireland': '🇮🇪',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Hungary': '🇭🇺',
  'Switzerland': '🇨🇭',
  'South Africa': '🇿🇦',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Azerbaijan': '🇦🇿',
  'Monaco': '🇲🇨',
};

// Get country flag emoji from country name or timezone string
export const getCountryFlag = (countryOrTimezone: string): string => {
  // Check if it's a direct match in our country map
  if (countryToFlagEmoji[countryOrTimezone]) {
    return countryToFlagEmoji[countryOrTimezone];
  }
  
  // Try to extract country from timezone string
  const timezoneParts = countryOrTimezone.split('/');
  const region = timezoneParts[0];
  
  // Map regions to countries
  const regionToCountry: Record<string, string> = {
    'America': '🇺🇸',
    'Europe': '🇪🇺',
    'Asia': '🇦🇸',
    'Africa': '🇦🇫',
    'Australia': '🇦🇺',
    'Pacific': '🇳🇿',
    'Atlantic': '🇬🇧',
    'Indian': '🇮🇳'
  };
  
  // For specific cities, override with more precise flags
  if (countryOrTimezone === 'Europe/London') return '🇬🇧';
  if (countryOrTimezone === 'Europe/Paris') return '🇫🇷';
  if (countryOrTimezone === 'Europe/Berlin') return '🇩🇪';
  if (countryOrTimezone === 'Europe/Rome') return '🇮🇹';
  if (countryOrTimezone === 'Europe/Madrid') return '🇪🇸';
  if (countryOrTimezone === 'Europe/Monaco') return '🇲🇨';
  if (countryOrTimezone === 'Europe/Amsterdam') return '🇳🇱';
  if (countryOrTimezone === 'Europe/Brussels') return '🇧🇪';
  if (countryOrTimezone === 'Europe/Budapest') return '🇭🇺';
  if (countryOrTimezone === 'Europe/Zurich') return '🇨🇭';
  if (countryOrTimezone === 'Europe/Oslo') return '🇳🇴';
  if (countryOrTimezone === 'Europe/Stockholm') return '🇸🇪';
  if (countryOrTimezone === 'Europe/Helsinki') return '🇫🇮';
  if (countryOrTimezone === 'Europe/Moscow') return '🇷🇺';
  if (countryOrTimezone === 'Asia/Tokyo') return '🇯🇵';
  if (countryOrTimezone === 'Asia/Seoul') return '🇰🇷';
  if (countryOrTimezone === 'Asia/Pyongyang') return '🇰🇵';
  if (countryOrTimezone === 'Asia/Shanghai') return '🇨🇳';
  if (countryOrTimezone === 'Asia/Hong_Kong') return '🇭🇰';
  if (countryOrTimezone === 'Asia/Taipei') return '🇹🇼';
  if (countryOrTimezone === 'Asia/Singapore') return '🇸🇬';
  if (countryOrTimezone === 'Asia/Baku') return '🇦🇿';
  if (countryOrTimezone === 'Asia/Dubai') return '🇦🇪';
  if (countryOrTimezone === 'Australia/Melbourne') return '🇦🇺';
  if (countryOrTimezone === 'America/New_York') return '🇺🇸';
  if (countryOrTimezone === 'America/Los_Angeles') return '🇺🇸';
  if (countryOrTimezone === 'America/Chicago') return '🇺🇸';
  if (countryOrTimezone === 'America/Vancouver') return '🇨🇦';
  if (countryOrTimezone === 'America/Toronto') return '🇨🇦';
  if (countryOrTimezone === 'America/Mexico_City') return '🇲🇽';
  if (countryOrTimezone === 'America/Sao_Paulo') return '🇧🇷';
  if (countryOrTimezone === 'Pacific/Auckland') return '🇳🇿';
  
  return regionToCountry[region] || '🌍';
};

// Time zone abbreviation map
const timezoneToAbbr: Record<string, string> = {
  'America/New_York': 'EDT',
  'America/Chicago': 'CDT',
  'America/Denver': 'MDT',
  'America/Los_Angeles': 'PDT',
  'America/Vancouver': 'PDT',
  'America/Anchorage': 'AKDT',
  'America/Phoenix': 'MST',
  'America/Honolulu': 'HST',
  'America/Mexico_City': 'CST',
  'America/Toronto': 'EDT',
  'America/Sao_Paulo': 'BRT',
  'Europe/London': 'BST',
  'Europe/Paris': 'CEST',
  'Europe/Berlin': 'CEST',
  'Europe/Rome': 'CEST',
  'Europe/Madrid': 'CEST',
  'Europe/Monaco': 'CEST',
  'Europe/Amsterdam': 'CEST',
  'Europe/Budapest': 'CEST',
  'Europe/Brussels': 'CEST',
  'Europe/Zurich': 'CEST',
  'Europe/Oslo': 'CEST',
  'Europe/Stockholm': 'CEST',
  'Europe/Helsinki': 'EEST',
  'Europe/Moscow': 'MSK',
  'Asia/Baku': 'AZT',
  'Asia/Dubai': 'GST',
  'Asia/Tokyo': 'JST',
  'Asia/Shanghai': 'CST',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Taipei': 'CST',
  'Asia/Seoul': 'KST',
  'Asia/Pyongyang': 'KST',
  'Asia/Singapore': 'SGT',
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
