// Time Zone Types
export interface TimeZone {
  name: string;
  value: string;
  offset: string;
  abbr: string;
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
