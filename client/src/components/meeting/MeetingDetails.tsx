import { useState, useEffect } from 'react';
import { MeetingDetails as MeetingDetailsType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MeetingDetailsProps {
  meetingDetails: MeetingDetailsType;
  onUpdate: (details: Partial<MeetingDetailsType>) => void;
}

export default function MeetingDetails({ meetingDetails, onUpdate }: MeetingDetailsProps) {
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
        <Label htmlFor="meeting-title" className="block text-sm font-medium text-neutral-700 mb-1">
          Meeting Title
        </Label>
        <Input 
          type="text" 
          id="meeting-title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      
      {/* Date Picker */}
      <div className="mb-4">
        <Label htmlFor="meeting-date" className="block text-sm font-medium text-neutral-700 mb-1">
          Date
        </Label>
        <Input 
          type="date" 
          id="meeting-date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      
      {/* Duration Picker */}
      <div className="mb-4">
        <Label htmlFor="meeting-duration" className="block text-sm font-medium text-neutral-700 mb-1">
          Duration
        </Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Working Hours */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-neutral-700 mb-1">
          Working Hours (Your Local Time)
        </Label>
        <div className="flex items-center space-x-2">
          <Select value={workingHoursStart} onValueChange={setWorkingHoursStart}>
            <SelectTrigger className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="06:00">6:00 AM</SelectItem>
              <SelectItem value="07:00">7:00 AM</SelectItem>
              <SelectItem value="08:00">8:00 AM</SelectItem>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
            </SelectContent>
          </Select>
          <span>to</span>
          <Select value={workingHoursEnd} onValueChange={setWorkingHoursEnd}>
            <SelectTrigger className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white">
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="17:00">5:00 PM</SelectItem>
              <SelectItem value="18:00">6:00 PM</SelectItem>
              <SelectItem value="19:00">7:00 PM</SelectItem>
              <SelectItem value="20:00">8:00 PM</SelectItem>
              <SelectItem value="21:00">9:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
