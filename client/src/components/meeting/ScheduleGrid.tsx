import { useState, useEffect } from 'react';
import { formatDate, generateGoogleCalendarUrl, generateAppleCalendarUrl } from '@/utils/timeUtils';
import { useTimeZone } from '@/context/TimeZoneContext';
import { ScheduleColumn, TeamMemberWithLocalTime } from '@/types';
import { convertTime } from '@/utils/timeUtils';
import { getTimezoneAbbr } from '@/utils/formatUtils';
import { useToast } from '@/hooks/use-toast';

export default function ScheduleGrid() {
  const { toast } = useToast();
  const { 
    teamMembers, 
    meetingDetails, 
    timeSlots,
    selectedTimeSlot,
    selectTimeSlot
  } = useTimeZone();
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  
  // Generate columns for the schedule grid
  const generateScheduleGrid = () => {
    // Get the current reference time zone (the first team member's time zone)
    const referenceTimezone = teamMembers.length > 0 ? teamMembers[0].timeZone : 'America/New_York';
    
    return timeSlots.map(slot => {
      const cells = teamMembers.map(member => {
        // Convert the slot time to the team member's local time
        const localDateTime = convertTime(
          `${slot.hour}:00`,
          meetingDetails.date,
          referenceTimezone,
          member.timeZone
        );
        
        // Check if this time is within the member's working hours
        const timeValue = localDateTime.time.split(' ')[0]; // e.g., "9:00" from "9:00 AM"
        const [localHour, localMinute] = timeValue.split(':').map(Number);
        const [startHour, startMinute] = member.workingHoursStart.split(':').map(Number);
        const [endHour, endMinute] = member.workingHoursEnd.split(':').map(Number);
        
        const localTimeDecimal = localHour + (localMinute / 60);
        const startTimeDecimal = startHour + (startMinute / 60);
        const endTimeDecimal = endHour + (endMinute / 60);
        
        const isAvailable = 
          localTimeDecimal >= startTimeDecimal && 
          localTimeDecimal < endTimeDecimal;
        
        return {
          teamMemberId: member.id,
          hour: slot.hour,
          available: isAvailable,
          selected: selectedTime === slot.formatted
        };
      });
      
      return {
        time: slot.formatted,
        cells
      };
    });
  };
  
  const [scheduleColumns, setScheduleColumns] = useState<ScheduleColumn[]>([]);
  
  useEffect(() => {
    setScheduleColumns(generateScheduleGrid());
  }, [teamMembers, meetingDetails, selectedTime]);
  
  // Handle time slot selection
  const handleTimeSlotClick = (time: string) => {
    if (selectedTime === time) {
      setSelectedTime(null);
      setEndTime(null);
      selectTimeSlot("");  
      return;
    }
    
    setSelectedTime(time);
    selectTimeSlot(time);
    
    // Calculate end time based on meeting duration
    const startDateTime = new Date(`2000-01-01T${time}`);
    startDateTime.setMinutes(startDateTime.getMinutes() + meetingDetails.duration);
    const formattedEndTime = startDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    setEndTime(formattedEndTime);
  };
  
  // Calculate if a time slot is available for all team members
  const isTimeSlotAvailableForAll = (column: ScheduleColumn) => {
    return column.cells.every(cell => cell.available);
  };
  
  // Generate meeting details for calendar integration
  const getMeetingForCalendar = () => {
    if (!selectedTime || !endTime) return null;
    
    // Convert 12-hour to 24-hour format for startTime
    const [timePart, period] = selectedTime.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    const startHour = (period === 'PM' && hours !== 12) ? hours + 12 : (period === 'AM' && hours === 12) ? 0 : hours;
    const startTime = `${startHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Convert 12-hour to 24-hour format for endTime
    const [endTimePart, endPeriod] = endTime.split(' ');
    const [endHours, endMinutes] = endTimePart.split(':').map(Number);
    const endHour = (endPeriod === 'PM' && endHours !== 12) ? endHours + 12 : (endPeriod === 'AM' && endHours === 12) ? 0 : endHours;
    const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    const referenceTimezone = teamMembers.length > 0 ? teamMembers[0].timeZone : 'America/New_York';
    
    return {
      title: meetingDetails.title,
      date: meetingDetails.date,
      startTime,
      endTime: endTimeFormatted,
      timezone: referenceTimezone,
      description: `Meeting with: ${teamMembers.map(m => m.name).join(', ')}`
    };
  };
  
  // Handle calendar integration
  const addToGoogleCalendar = () => {
    const meeting = getMeetingForCalendar();
    if (!meeting) return;
    
    const url = generateGoogleCalendarUrl(meeting);
    window.open(url, '_blank');
  };
  
  const addToAppleCalendar = () => {
    const meeting = getMeetingForCalendar();
    if (!meeting) return;
    
    const url = generateAppleCalendarUrl(meeting);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Copy meeting details to clipboard
  const copyMeetingDetails = () => {
    if (!selectedTime || !endTime) return;
    
    let details = `${meetingDetails.title}\n`;
    details += `Date: ${formatDate(meetingDetails.date)}\n`;
    details += `Time: ${selectedTime} - ${endTime}\n\n`;
    details += `Team Member Times:\n`;
    
    // Get the reference time zone from the first team member
    const referenceTimezone = teamMembers.length > 0 ? teamMembers[0].timeZone : 'America/New_York';
    
    teamMembers.forEach(member => {
      // Convert selected time to member's time zone
      const localDateTime = convertTime(
        selectedTime.replace(/\s/g, ''),
        meetingDetails.date,
        referenceTimezone,
        member.timeZone
      );
      
      const localEndDateTime = convertTime(
        endTime.replace(/\s/g, ''),
        meetingDetails.date,
        referenceTimezone,
        member.timeZone
      );
      
      details += `${member.flag} ${member.name} (${member.country}): ${localDateTime.time} - ${localEndDateTime.time} ${getTimezoneAbbr(member.timeZone)}`;
      
      // Add next day indicator if applicable
      if (localDateTime.date !== formatDate(meetingDetails.date)) {
        details += ` (${localDateTime.date})`;
      }
      
      details += '\n';
    });
    
    navigator.clipboard.writeText(details)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Meeting details copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Error",
          description: "Failed to copy meeting details",
          variant: "destructive"
        });
      });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Schedule Meeting</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="block w-3 h-3 rounded-full bg-secondary mr-2"></span>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <span className="block w-3 h-3 rounded-full bg-neutral-300 mr-2"></span>
            <span className="text-sm">Unavailable</span>
          </div>
          <div className="flex items-center">
            <span className="block w-3 h-3 rounded-full bg-primary/30 mr-2"></span>
            <span className="text-sm">Selected</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 mb-6">
        {/* Timezone Table */}
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left font-medium text-neutral-500 w-28">Team Member</th>
              {/* Time Headers */}
              {scheduleColumns.map((column, idx) => (
                <th 
                  key={idx} 
                  className="py-1 px-2 text-center font-medium text-neutral-500 border-b border-neutral-200 min-w-[100px]"
                >
                  {column.time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Generate rows for each team member */}
            {teamMembers.map((member, rowIdx) => (
              <tr key={member.id}>
                <td className="py-2 px-3 border-r border-neutral-200">
                  <div className="flex items-center">
                    <span className="mr-2">{member.flag}</span>
                    <span>{member.name.split(' ')[0]}</span>
                  </div>
                </td>
                {/* Time Slots */}
                {scheduleColumns.map((column, colIdx) => {
                  const cell = column.cells.find(c => c.teamMemberId === member.id);
                  return (
                    <td key={`${rowIdx}-${colIdx}`} className="p-1 border border-neutral-200">
                      <div 
                        className={`time-slot h-8 rounded-md ${
                          cell?.selected ? 'selected cursor-pointer' : 
                          cell?.available ? 'bg-secondary/20 cursor-pointer' : 'unavailable'
                        }`}
                        onClick={() => {
                          if (cell?.available) {
                            handleTimeSlotClick(column.time);
                          }
                        }}
                      ></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTime && endTime && (
        <div className="bg-background rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">📅 Selected Meeting Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Date</p>
              <p className="font-medium">{formatDate(meetingDetails.date)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Time</p>
              <p className="font-medium">
                {selectedTime} - {endTime} ({teamMembers.length > 0 ? teamMembers[0].country : 'Local Time'})
              </p>
            </div>
          </div>
          <div className="mt-3">
            {teamMembers.map(member => {
              // Convert selected time to member's time zone
              const referenceTimezone = teamMembers.length > 0 ? teamMembers[0].timeZone : 'America/New_York';
              const localDateTime = convertTime(
                selectedTime.replace(/\s/g, ''),
                meetingDetails.date,
                referenceTimezone,
                member.timeZone
              );
              
              const localEndDateTime = convertTime(
                endTime.replace(/\s/g, ''),
                meetingDetails.date,
                referenceTimezone,
                member.timeZone
              );
              
              const timeZoneAbbr = getTimezoneAbbr(member.timeZone);
              const nextDayIndicator = localDateTime.date !== formatDate(meetingDetails.date)
                ? ` (${localDateTime.date})`
                : '';
              
              return (
                <div key={member.id} className="flex items-center mb-1">
                  <span className="mr-2">{member.flag}</span>
                  <span className="font-medium">{member.country} ({timeZoneAbbr}):</span>
                  <span className="ml-2">{localDateTime.time} - {localEndDateTime.time}{nextDayIndicator}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center"
          disabled={!selectedTime}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Confirm Meeting
        </button>
        <button 
          className="bg-white border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary/5 transition-colors flex items-center"
          onClick={copyMeetingDetails}
          disabled={!selectedTime}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy Meeting Details
        </button>
        <button 
          className="bg-white border border-neutral-300 text-textColor px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors flex items-center"
          onClick={addToGoogleCalendar}
          disabled={!selectedTime}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Add to Google Calendar
        </button>
        <button 
          className="bg-white border border-neutral-300 text-textColor px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors flex items-center"
          onClick={addToAppleCalendar}
          disabled={!selectedTime}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Add to Apple Calendar
        </button>
      </div>
    </div>
  );
}
