import { useState } from 'react';
import { useTimeZone } from '@/context/TimeZoneContext';
import TimeZoneCard from '@/components/time/TimeZoneCard';
import { timezones } from '@/utils/timeUtils';
import { getCountryFlag } from '@/utils/formatUtils';
import { TeamMember } from '@/types';

export default function TimeZoneList() {
  const { teamMembers, addTeamMember, removeTeamMember, isLoading } = useTimeZone();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');

  const handleAddMember = async () => {
    if (!name || !country || !timeZone) return;
    
    const flag = getCountryFlag(country);
    
    await addTeamMember({
      name,
      country,
      timeZone,
      flag,
      workingHoursStart,
      workingHoursEnd
    });
    
    // Reset form
    setName('');
    setCountry('');
    setTimeZone('');
    setWorkingHoursStart('08:00');
    setWorkingHoursEnd('17:00');
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="text-primary hover:text-primary/80 flex items-center text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Member
          </button>
        </div>
        
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add Team Member</h3>
                <button 
                  onClick={() => setIsDialogOpen(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter member name" 
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="country" className="text-sm font-medium">Country</label>
                  <input 
                    id="country" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="Enter country" 
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="timezone" className="text-sm font-medium">Time Zone</label>
                  <select 
                    id="timezone" 
                    value={timeZone} 
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="">Select a timezone</option>
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Working Hours</label>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={workingHoursStart} 
                      onChange={(e) => setWorkingHoursStart(e.target.value)}
                      className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                    >
                      {Array.from({ length: 13 }, (_, i) => i + 6).map((hour) => (
                        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                        </option>
                      ))}
                    </select>
                    <span>to</span>
                    <select 
                      value={workingHoursEnd} 
                      onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                    >
                      {Array.from({ length: 13 }, (_, i) => i + 12).map((hour) => (
                        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  onClick={() => setIsDialogOpen(false)} 
                  className="px-4 py-2 border border-neutral-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddMember} 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  disabled={!name || !country || !timeZone}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team member list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <p>No team members added yet</p>
            <p className="text-sm mt-2">Click "Add Member" to add team members</p>
          </div>
        ) : (
          teamMembers.map((member: TeamMember) => (
            <TimeZoneCard
              key={member.id}
              member={member}
              onRemove={() => removeTeamMember(member.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
