import { convertTime, timezones } from './timeUtils';

// Helper function to run test cases
function testTimeConversion(
  fromCity: string,
  toCity: string,
  sourceTime: string,
  sourceDate: string,
  expectedTime?: string,
  expectedDate?: string
) {
  const fromTimezone = timezones.find(tz => tz.name.includes(fromCity))?.value;
  const toTimezone = timezones.find(tz => tz.name.includes(toCity))?.value;
  
  if (!fromTimezone || !toTimezone) {
    console.error(`Could not find timezone for ${!fromTimezone ? fromCity : toCity}`);
    return;
  }

  const result = convertTime(sourceTime, sourceDate, fromTimezone, toTimezone);
  console.log(`Converting from ${fromCity} to ${toCity}:`);
  console.log(`  Input: ${sourceTime} ${sourceDate} ${fromTimezone}`);
  console.log(`  Output: ${result.time} ${result.date} ${toTimezone}`);
  if (expectedTime && expectedDate) {
    console.log(`  Expected: ${expectedTime} ${expectedDate}`);
    console.log(`  Matches: ${result.time === expectedTime && result.date === expectedDate ? 'Yes' : 'No'}`);
  }
  console.log('---');
}

// Test various city combinations
console.log('Running time conversion tests...\n');

// Test same timezone (should return same time)
testTimeConversion('San Francisco', 'San Francisco', '09:00', '2025.02.28');

// Test common timezone pairs
testTimeConversion('San Francisco', 'New York', '09:00', '2025.02.28');
testTimeConversion('London', 'Tokyo', '14:00', '2025.02.28');
testTimeConversion('Paris', 'New York', '15:00', '2025.02.28');
testTimeConversion('Tokyo', 'London', '10:00', '2025.02.28');
testTimeConversion('Dubai', 'Singapore', '12:00', '2025.02.28');
testTimeConversion('New York', 'Shanghai', '20:00', '2025.02.28');
testTimeConversion('Auckland', 'San Francisco', '08:00', '2025.02.28');

// Test edge cases (day changes)
testTimeConversion('Tokyo', 'San Francisco', '01:00', '2025.02.28');
testTimeConversion('San Francisco', 'Tokyo', '20:00', '2025.02.27');

// Test DST transition periods
testTimeConversion('London', 'New York', '14:00', '2025.03.30'); // Around EU DST change
testTimeConversion('New York', 'London', '14:00', '2025.03.10'); // Around US DST change
