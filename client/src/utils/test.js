// Simple test script to verify time conversions
const timezonePairs = [
  // Same timezone (should return same time)
  ['America/Los_Angeles', 'America/Los_Angeles', '09:00', '2025-02-28'],
  
  // Common timezone pairs
  ['America/Los_Angeles', 'America/New_York', '09:00', '2025-02-28'],
  ['Europe/London', 'Asia/Tokyo', '14:00', '2025-02-28'],
  ['Europe/Paris', 'America/New_York', '15:00', '2025-02-28'],
  ['Asia/Tokyo', 'Europe/London', '10:00', '2025-02-28'],
  ['Asia/Dubai', 'Asia/Singapore', '12:00', '2025-02-28'],
  ['America/New_York', 'Asia/Shanghai', '20:00', '2025-02-28'],
  ['Pacific/Auckland', 'America/Los_Angeles', '08:00', '2025-02-28'],
  
  // Edge cases (day changes)
  ['Asia/Tokyo', 'America/Los_Angeles', '01:00', '2025-02-28'],
  ['America/Los_Angeles', 'Asia/Tokyo', '20:00', '2025-02-27'],
  
  // DST transition periods
  ['Europe/London', 'America/New_York', '14:00', '2025-03-30'], // Around EU DST change
  ['America/New_York', 'Europe/London', '14:00', '2025-03-10']  // Around US DST change
];

timezonePairs.forEach(([fromTz, toTz, time, date]) => {
  console.log(`\nConverting from ${fromTz} to ${toTz}:`);
  console.log(`Input: ${time} ${date}`);
  
  // Create date object in source timezone
  const [hours, minutes] = time.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);
  
  const sourceDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  console.log(`UTC time: ${sourceDate.toISOString()}`);
  
  // Get timezone offsets
  const fromOffset = new Date(date).toLocaleString('en-US', { timeZone: fromTz, timeZoneName: 'longOffset' }).split(' ').pop();
  const toOffset = new Date(date).toLocaleString('en-US', { timeZone: toTz, timeZoneName: 'longOffset' }).split(' ').pop();
  
  console.log(`From timezone offset: ${fromOffset}`);
  console.log(`To timezone offset: ${toOffset}`);
  
  // Get time in target timezone
  const targetTime = sourceDate.toLocaleString('en-US', { 
    timeZone: toTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log(`Result: ${targetTime}`);
  console.log('---');
});
