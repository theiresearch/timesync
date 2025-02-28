import { useState, useEffect } from 'react';
import { MeetingDetails as MeetingDetailsType } from '@/types';

interface MeetingDetailsProps {
  meetingDetails: MeetingDetailsType;
  onUpdate: (details: Partial<MeetingDetailsType>) => void;
}

export default function MeetingDetails({ meetingDetails, onUpdate }: MeetingDetailsProps): JSX.Element {
  const [title, setTitle] = useState(meetingDetails.title);
  const [date, setDate] = useState(meetingDetails.date);
  const [duration, setDuration] = useState(meetingDetails.duration.toString());
  const [workingHoursStart, setWorkingHoursStart] = useState(meetingDetails.workingHoursStart);
  const [workingHoursEnd, setWorkingHoursEnd] = useState(meetingDetails.workingHoursEnd);

  // Update parent component when values change
  useEffect(() => {
    onUpdate({
      title,
      date,
      duration: parseInt(duration),
      workingHoursStart,
      workingHoursEnd
    });
  }, [title, date, duration, workingHoursStart, workingHoursEnd, onUpdate]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4">Meeting Details</h2>
      
      {/* Meeting Title Input */}
      <div className="mb-4">
        <label htmlFor="meeting-title" className="block text-sm font-medium text-neutral-700 mb-1">
          Meeting Title
        </label>
        <input 
          type="text" 
          id="meeting-title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      
      {/* Date Picker */}
      <div className="mb-4">
        <label htmlFor="meeting-date" className="block text-sm font-medium text-neutral-700 mb-1">
          Date
        </label>
        <input 
          type="date" 
          id="meeting-date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      
      {/* Duration Picker */}
      <div className="mb-4">
        <label htmlFor="meeting-duration" className="block text-sm font-medium text-neutral-700 mb-1">
          Duration
        </label>
        <select 
          id="meeting-duration" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
      </div>

      {/* Working Hours */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Working Hours (Your Local Time)
        </label>
        <div className="flex items-center space-x-2">
          <select 
            value={workingHoursStart} 
            onChange={(e) => setWorkingHoursStart(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
          >
            <option value="06:00">6:00 AM</option>
            <option value="07:00">7:00 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
          </select>
          <span>to</span>
          <select 
            value={workingHoursEnd} 
            onChange={(e) => setWorkingHoursEnd(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
          >
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}
