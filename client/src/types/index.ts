// Time Zone Types
// The offset here is just a reference display value.
// Actual timezone calculations use the IANA identifier (value) 
// which handles DST (daylight saving time) transitions automatically
export interface TimeZone {
  name: string;       // Display name with UTC offset
  value: string;      // City identifier (e.g., "City/San_Francisco" or "Europe/London")
  ianaTimezone?: string; // IANA timezone identifier for time calculations (e.g., "America/Los_Angeles")
  offset: string;     // UTC offset for display (may change with DST)
  abbr: string;       // Abbreviation (e.g., "GMT", "BST", "EDT")
  id?: string;        // Unique identifier to prevent React key conflicts
}

// Team Member Types
export interface TeamMember {
  id: number;
  name: string;
  country: string;
  timeZone: string;
  flag: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  createdAt?: string;
}

export interface TeamMemberWithLocalTime extends TeamMember {
  localTime: string;
  localDate: string;
  isWorkingHours: boolean;
}

// Meeting Types
export interface TimeSlot {
  hour: number;
  minute: number;
  formatted: string;
}

export interface MeetingDetails {
  title: string;
  date: string;
  duration: number;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export interface MeetingParticipant {
  teamMemberId: number;
  localStartTime: string;
  localEndTime: string;
  localDate: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  participants: MeetingParticipant[];
  createdAt?: string;
}

// Schedule Grid Types
export interface ScheduleCell {
  teamMemberId: number;
  hour: number;
  available: boolean;
  selected: boolean;
}

export interface ScheduleColumn {
  time: string;
  cells: ScheduleCell[];
}

// Calendar Integration
export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  timezone: string;
  description: string;
  location?: string;
}

// Application State
export type TabType = 'scheduler' | 'converter' | 'team';
