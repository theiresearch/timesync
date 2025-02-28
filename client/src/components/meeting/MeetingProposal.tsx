import { useState, useEffect } from 'react';
import { useTimeZone } from '@/context/TimeZoneContext';
import { convertTime, formatDate } from '@/utils/timeUtils';
import { getTimezoneAbbr, copyToClipboard } from '@/utils/formatUtils';
import { useToast } from '@/hooks/use-toast';

export default function MeetingProposal() {
  const { toast } = useToast();
  const { teamMembers, meetingDetails, selectedTimeSlot } = useTimeZone();
  const [proposalText, setProposalText] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  useEffect(() => {
    if (!selectedTimeSlot) {
      setProposalText('');
      setEndTime('');
      return;
    }

    // Calculate end time based on duration
    const [time, period] = selectedTimeSlot.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(period === 'PM' && hour !== 12 ? hour + 12 : hour);
    startDate.setMinutes(minute);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + meetingDetails.duration);
    
    const formattedEndTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    setEndTime(formattedEndTime);
    
    // Generate proposal text
    generateProposal(selectedTimeSlot, formattedEndTime);
  }, [selectedTimeSlot, meetingDetails]);
  
  const generateProposal = (startTime: string, endTime: string) => {
    const proposal = `Meeting Proposal: ${meetingDetails.title} on ${formatDate(meetingDetails.date)} from ${startTime} to ${endTime}`;
    setProposalText(proposal);
  };
  
  const handleCopyProposal = () => {
    if (proposalText) {
      copyToClipboard(document.getElementById('proposal-text')?.innerText || '');
      toast({
        title: "Success",
        description: "Proposal copied to clipboard!",
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4">Meeting Proposal</h2>
      
      <div className="bg-neutral-50 p-4 rounded-md mb-4 min-h-[200px]" id="proposal-text">
        {proposalText ? (
          <>
            <p className="mb-3">Hi team,</p>
            <p className="mb-3">I'm proposing we have our {meetingDetails.title} on {formatDate(meetingDetails.date)}. Here are the times for each team member:</p>
            
            <ul className="mb-3 space-y-1">
              {teamMembers.map(member => {
                // Reference time zone (using the first team member's time zone)
                const referenceTimezone = teamMembers[0].timeZone;
                
                // Convert times to member's time zone
                const localStartDateTime = convertTime(
                  selectedTimeSlot ? selectedTimeSlot.replace(/\s/g, '') : "",
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
                
                const tzAbbr = getTimezoneAbbr(member.timeZone);
                const nextDayIndicator = localStartDateTime.date !== formatDate(meetingDetails.date) 
                  ? ` (${localStartDateTime.date})` 
                  : '';
                
                return (
                  <li key={member.id} className="flex">
                    <span className="mr-2">{member.flag}</span>
                    <span><strong>{member.name} ({member.country}):</strong> {localStartDateTime.time} - {localEndDateTime.time} {tzAbbr}{nextDayIndicator}</span>
                  </li>
                );
              })}
            </ul>
            
            <p className="mb-3">Please let me know if this time works for everyone. I understand it may be outside working hours for some team members, so we can look for alternatives if needed.</p>
            
            <p>Best regards,<br/>[Your Name]</p>
          </>
        ) : (
          <div className="text-center text-neutral-500 py-4">
            {teamMembers.length === 0 ? (
              <p>Add team members and select a meeting time to generate a proposal</p>
            ) : !selectedTimeSlot ? (
              <p>Select a meeting time to generate a proposal</p>
            ) : (
              <p>Generating proposal...</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center"
          onClick={handleCopyProposal}
          disabled={!proposalText}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy Proposal
        </button>
        <div className="flex space-x-2">
          <button
            className="bg-white border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors"
            disabled={!proposalText}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="bg-white border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors"
            disabled={!proposalText}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
