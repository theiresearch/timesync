import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TeamMember, TeamMemberWithLocalTime, MeetingDetails, TimeSlot } from '../types';
import { addLocalTimeToTeamMembers, generateTimeSlots, convertTime } from '../utils/timeUtils';
import { apiRequest } from '../lib/queryClient';

interface TimeZoneContextType {
  teamMembers: TeamMemberWithLocalTime[];
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  meetingDetails: MeetingDetails;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  removeTeamMember: (id: number) => Promise<void>;
  updateTeamMember: (id: number, data: Partial<TeamMember>) => Promise<void>;
  updateMeetingDetails: (details: Partial<MeetingDetails>) => void;
  selectTimeSlot: (time: string) => void;
  selectDate: (date: string) => void;
  refreshTeamMembers: () => Promise<void>;
}

const defaultMeetingDetails: MeetingDetails = {
  title: 'Weekly Team Sync',
  date: new Date().toISOString().split('T')[0],
  duration: 60,
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
};

const TimeZoneContext = createContext<TimeZoneContextType | undefined>(undefined);

export function TimeZoneProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithLocalTime[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots(6, 23));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails>(defaultMeetingDetails);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members on component mount
  useEffect(() => {
    refreshTeamMembers();
  }, []);

  // Refresh team members
  const refreshTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/team-members');
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data: TeamMember[] = await response.json();
      const membersWithLocalTime = addLocalTimeToTeamMembers(data, selectedDate);
      setTeamMembers(membersWithLocalTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add team member
  const addTeamMember = async (member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    try {
      await apiRequest('POST', '/api/team-members', member);
      await refreshTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
      console.error('Error adding team member:', err);
    }
  };

  // Remove team member
  const removeTeamMember = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/team-members/${id}`);
      await refreshTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
      console.error('Error removing team member:', err);
    }
  };

  // Update team member
  const updateTeamMember = async (id: number, data: Partial<TeamMember>) => {
    try {
      await apiRequest('PUT', `/api/team-members/${id}`, data);
      await refreshTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      console.error('Error updating team member:', err);
    }
  };

  // Update meeting details
  const updateMeetingDetails = (details: Partial<MeetingDetails>) => {
    setMeetingDetails(prev => ({ ...prev, ...details }));
  };

  // Select time slot
  const selectTimeSlot = (time: string) => {
    setSelectedTimeSlot(time);
  };

  // Select date
  const selectDate = (date: string) => {
    setSelectedDate(date);
    setMeetingDetails(prev => ({ ...prev, date }));
    
    // Update team members with local times for the new date
    setTeamMembers(prev => addLocalTimeToTeamMembers(prev, date));
  };

  const value = {
    teamMembers,
    timeSlots,
    selectedTimeSlot,
    meetingDetails,
    selectedDate,
    isLoading,
    error,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    updateMeetingDetails,
    selectTimeSlot,
    selectDate,
    refreshTeamMembers
  };

  return (
    <TimeZoneContext.Provider value={value}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export function useTimeZone() {
  const context = useContext(TimeZoneContext);
  if (context === undefined) {
    throw new Error('useTimeZone must be used within a TimeZoneProvider');
  }
  return context;
}
