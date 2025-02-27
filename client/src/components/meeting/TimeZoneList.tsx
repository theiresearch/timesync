import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-primary hover:text-primary/80 flex items-center text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter member name" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  placeholder="e.g. United States, Japan" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.id || tz.value} value={tz.value}>
                        {tz.name} ({tz.abbr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="work-start">Working Hours Start</Label>
                  <Select value={workingHoursStart} onValueChange={setWorkingHoursStart}>
                    <SelectTrigger id="work-start">
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
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="work-end">Working Hours End</Label>
                  <Select value={workingHoursEnd} onValueChange={setWorkingHoursEnd}>
                    <SelectTrigger id="work-end">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="19:00">7:00 PM</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleAddMember}>Add Team Member</Button>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-4 text-center">Loading team members...</div>
      ) : teamMembers.length === 0 ? (
        <div className="p-4 text-center text-neutral-500">
          No team members yet. Add your first team member.
        </div>
      ) : (
        teamMembers.map((member) => (
          <TimeZoneCard 
            key={member.id} 
            member={member} 
            onRemove={removeTeamMember} 
          />
        ))
      )}
    </div>
  );
}
