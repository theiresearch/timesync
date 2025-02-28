// Timezone Debug Utility
// This file provides utility functions to debug timezone issues

import { formatInTimeZone } from 'date-fns-tz';
import { timezones } from './timeUtils';

/**
 * Returns the UTC offset for a timezone on a specific date
 * Useful for checking DST transitions
 */
export function checkOffsetOnDate(timezone: string, date: Date): string {
  try {
    const formattedDate = formatInTimeZone(date, timezone, 'XXX');
    return formattedDate === 'Z' ? '+00:00' : formattedDate;
  } catch (error) {
    console.error(`Error checking offset for ${timezone}:`, error);
    return "+00:00";
  }
}

/**
 * Logs the UTC offset for a timezone on multiple dates throughout the year
 * Helps identify DST transition dates
 */
export function logYearlyOffsets(timezone: string): void {
  const year = new Date().getFullYear();
  console.log(`UTC offsets for ${timezone} in ${year}:`);
  
  // Check each month
  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 15); // 15th of each month
    const offset = checkOffsetOnDate(timezone, date);
    console.log(`${date.toLocaleString('default', { month: 'long' })} 15: ${offset}`);
  }
  
  // More precise checks around typical DST transition dates (last Sunday in March and October for Europe)
  // March transition (to DST)
  for (let day = 24; day <= 31; day++) {
    const date = new Date(year, 2, day); // March
    if (date.getDay() === 0) { // Sunday
      const beforeDate = new Date(year, 2, day, 1, 0); // 1 AM
      const afterDate = new Date(year, 2, day, 3, 0);  // 3 AM
      console.log(`March ${day} (before DST): ${checkOffsetOnDate(timezone, beforeDate)}`);
      console.log(`March ${day} (after DST): ${checkOffsetOnDate(timezone, afterDate)}`);
    }
  }
  
  // October transition (from DST)
  for (let day = 24; day <= 31; day++) {
    const date = new Date(year, 9, day); // October
    if (date.getDay() === 0) { // Sunday
      const beforeDate = new Date(year, 9, day, 1, 0); // 1 AM
      const afterDate = new Date(year, 9, day, 3, 0);  // 3 AM
      console.log(`October ${day} (before DST end): ${checkOffsetOnDate(timezone, beforeDate)}`);
      console.log(`October ${day} (after DST end): ${checkOffsetOnDate(timezone, afterDate)}`);
    }
  }
}

/**
 * For quick debugging, check the current offset of common timezones
 */
export function checkCommonTimezones(): void {
  const now = new Date();
  console.log(`Current date: ${now.toISOString()}`);
  
  [
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Australia/Sydney'
  ].forEach(tz => {
    console.log(`${tz}: ${checkOffsetOnDate(tz, now)}`);
  });
}
