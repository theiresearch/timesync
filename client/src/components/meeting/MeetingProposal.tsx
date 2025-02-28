import React, { useState, useEffect } from 'react';
import { useTimeZone } from '@/context/TimeZoneContext';
import { convertTime, getTimezoneAbbr, formatDate, getActualUtcOffset } from '@/utils/timeUtils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function MeetingProposal() {
  const [proposalText, setProposalText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const { teamMembers, meetingDetails } = useTimeZone();

  // Time slots for the dropdown
  const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", 
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", 
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", 
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
  ];

  useEffect(() => {
    if (!teamMembers.length || !meetingDetails.date || !selectedTimeSlot) {
      setProposalText('');
      return;
    }

    let duration = 60; // Default 1 hour
    if (meetingDetails.duration) {
      duration = parseInt(meetingDetails.duration);
    }

    // Calculate end time
    const startTimeFormatted = selectedTimeSlot ? selectedTimeSlot.replace(/\s/g, '') : "";
    let endTimeValue = calculateEndTime(startTimeFormatted, duration);
    setStartTime(startTimeFormatted);
    setEndTime(endTimeValue);

    // Force the exact proposal format
    // This bypasses any other component or system that might be altering the format
    let exactProposal = `📅 Meeting Proposal\n\n`;
    
    // Reference timezone (first team member)
    if (teamMembers.length > 0) {
      const referenceTimezone = teamMembers[0].timeZone;
      
      // Get the meeting date
      const meetingDate = new Date(meetingDetails.date);
      const year = meetingDate.getFullYear();
      const month = String(meetingDate.getMonth() + 1).padStart(2, '0');
      const day = String(meetingDate.getDate()).padStart(2, '0');
      
      // Get the selected time 
      const timeMatch = selectedTimeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hour = 0;
      let minute = 0;
      
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
      }
      
      // Format time in 24-hour notation
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      // Get UTC offset for reference timezone
      const refOffset = getActualUtcOffset(referenceTimezone, meetingDate);
      
      // Add reference time zone with dot-formatted date
      exactProposal += `${teamMembers[0].flag} ${teamMembers[0].country} (UTC${refOffset}): ${year}.${month}.${day} ${formattedTime}\n\n`;
      
      // Add other time zones with hyphen-formatted date
      teamMembers.slice(1).forEach(member => {
        // Convert time to member's timezone
        const converted = convertTime(
          formattedTime,
          `${year}.${month}.${day}`,
          referenceTimezone,
          member.timeZone
        );
        
        // Get UTC offset for member's timezone
        const memberOffset = getActualUtcOffset(member.timeZone, meetingDate);
        
        // Add to proposal with desired format
        exactProposal += `${member.flag} ${member.country} (UTC${memberOffset}): ${converted.date} ${converted.time}\n`;
      });
    }
    
    setProposalText(exactProposal);
  }, [teamMembers, meetingDetails, selectedTimeSlot]);

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime) return '';

    try {
      const matches = startTime.match(/(\d+):(\d+)([AP]M)/i);
      if (!matches) return '';

      let hour = parseInt(matches[1]);
      const minute = parseInt(matches[2]);
      const period = matches[3].toUpperCase();

      // Convert to 24-hour format
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      // Create date object for calculations
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      date.setTime(date.getTime() + durationMinutes * 60 * 1000);

      // Format the end time
      let endHour = date.getHours();
      const endMinute = date.getMinutes();
      const endPeriod = endHour >= 12 ? 'PM' : 'AM';

      // Convert back to 12-hour format
      if (endHour > 12) endHour -= 12;
      if (endHour === 0) endHour = 12;

      return `${endHour}:${endMinute.toString().padStart(2, '0')}${endPeriod}`;
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalText).then(
      () => {
        alert('Proposal copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium text-neutral-800 mb-3">Meeting Proposal</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="timeSlot" className="block text-sm font-medium text-neutral-700 mb-1">
            Meeting Time Slot
          </label>
          <Select onValueChange={setSelectedTimeSlot} value={selectedTimeSlot} sensitivity="high">
            <SelectTrigger id="timeSlot" className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Preview</h4>
        <div className="bg-neutral-50 border border-neutral-200 rounded p-3 font-mono text-sm whitespace-pre-wrap min-h-[100px]">
          {proposalText ? (
            proposalText
          ) : (
            <p className="text-neutral-400">Select a time to generate a meeting proposal</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={copyToClipboard}
        disabled={!proposalText}
        className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Copy to Clipboard
      </button>
    </div>
  );
}
