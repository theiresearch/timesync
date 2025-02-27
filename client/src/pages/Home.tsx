import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

import { timezones, getCurrentTimeInTimezone, convertTime } from '@/utils/timeUtils';
import { getCountryFlag } from '@/utils/formatUtils';
import { PlusCircle, Clock, Calendar as CalendarIcon, Trash2, Copy } from 'lucide-react';

export default function Home() {
  // User timezone state
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [userName, setUserName] = useState('My Timezone');
  
  // Team timezones state
  const [teamTimezones, setTeamTimezones] = useState([
    { id: 1, name: 'UK Team', timezone: 'Europe/London', flag: '🇬🇧' },
    { id: 2, name: 'US Team', timezone: 'America/New_York', flag: '🇺🇸' }
  ]);
  
  // New team member form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTimezone, setNewTeamTimezone] = useState('');
  
  // Meeting time state
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date());
  const [meetingTime, setMeetingTime] = useState('09:00');
  const [meetingTitle, setMeetingTitle] = useState('Team Sync');
  
  const { toast } = useToast();
  
  // Add new team timezone
  const handleAddTeam = () => {
    if (newTeamName && newTeamTimezone) {
      // Get flag emoji based on timezone
      const countryFlag = getCountryFlag(newTeamTimezone);
      
      setTeamTimezones([
        ...teamTimezones,
        {
          id: Date.now(),
          name: newTeamName,
          timezone: newTeamTimezone,
          flag: countryFlag
        }
      ]);
      
      // Display success toast
      toast({
        title: "Team added",
        description: `${newTeamName} has been added.`,
        variant: "default",
      });
      
      // Reset form
      setNewTeamName('');
      setNewTeamTimezone('');
    } else {
      // Display error toast if form incomplete
      toast({
        title: "Missing information",
        description: "Please fill out team name and timezone.",
        variant: "destructive",
      });
    }
  };
  
  // Remove team timezone
  const handleRemoveTeam = (id: number) => {
    const teamToRemove = teamTimezones.find(team => team.id === id);
    setTeamTimezones(teamTimezones.filter(team => team.id !== id));
    
    if (teamToRemove) {
      toast({
        title: "Team removed",
        description: `${teamToRemove.name} has been removed from your list.`,
        variant: "default",
      });
    }
  };
  
  // Generate meeting proposal message in plain text format with 24h time
  const generateMeetingProposal = () => {
    if (!meetingDate || !meetingTime) return null;
    
    const formattedDate = meetingDate.toISOString().split('T')[0];
    const formattedMeetingDate = meetingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    
    let proposal = `📅 Meeting Time Proposal: ${meetingTitle}\n\n`;
    
    // User's time
    proposal += `My Time (${userName}):\n`;
    proposal += `🕒 ${meetingTime} on ${formattedMeetingDate}\n\n`;
    
    // Team times
    proposal += `Team Times:\n`;
    
    teamTimezones.forEach(team => {
      const convertedTime = convertTime(
        meetingTime,
        formattedDate,
        userTimezone,
        team.timezone
      );
      
      proposal += `${team.flag} ${team.name}: ${convertedTime.time} on ${convertedTime.date}\n`;
    });
    
    return proposal;
  };
  
  // Generate meeting times table for all zones
  const generateTimeTable = () => {
    if (!meetingDate) return null;
    
    const formattedDate = meetingDate.toISOString().split('T')[0];
    const timeInfo = [];
    
    // Add user's timezone
    const userCurrentTime = getCurrentTimeInTimezone(userTimezone);
    timeInfo.push({
      name: userName,
      timezone: userTimezone,
      flag: '🏠',
      currentTime: userCurrentTime.time,
      currentDate: userCurrentTime.date
    });
    
    // Add team timezones
    teamTimezones.forEach(team => {
      const teamCurrentTime = getCurrentTimeInTimezone(team.timezone);
      timeInfo.push({
        name: team.name,
        timezone: team.timezone,
        flag: team.flag,
        currentTime: teamCurrentTime.time,
        currentDate: teamCurrentTime.date
      });
    });
    
    return timeInfo;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Meeting proposal has been copied.",
          variant: "default",
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive",
        });
      });
  };
  
  const timeInfo = generateTimeTable();
  const proposalText = generateMeetingProposal();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">TimeSync</h1>
          <p className="text-sm sm:text-base text-neutral-500">Coordinate meetings across time zones with ease</p>
        </div>
        
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="setup">Setup Time Zones</TabsTrigger>
            <TabsTrigger value="meeting">Schedule Meeting</TabsTrigger>
          </TabsList>
          
          {/* Setup Tab */}
          <TabsContent value="setup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Your Timezone */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg">Your Time Zone</CardTitle>
                  <CardDescription>Set your name and time zone</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right whitespace-nowrap">Name</Label>
                      <Input 
                        id="name" 
                        className="col-span-3" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="timezone" className="text-right whitespace-nowrap">Timezone</Label>
                      <Select 
                        value={userTimezone} 
                        onValueChange={setUserTimezone}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.name} ({tz.offset})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right whitespace-nowrap">Current Time</div>
                      <div className="col-span-3 font-medium">
                        {getCurrentTimeInTimezone(userTimezone).time} {' '}
                        ({getCurrentTimeInTimezone(userTimezone).date})
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Timezone List */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg">Team Time Zones</CardTitle>
                  <CardDescription>Add time zones for your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamTimezones.map(team => (
                      <div key={team.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{team.flag}</span>
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{team.timezone}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveTeam(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2 text-sm sm:text-base">Add New Team</h3>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Team Name" 
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                          />
                          <Select 
                            value={newTeamTimezone} 
                            onValueChange={setNewTeamTimezone}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddTeam}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Team
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Meeting Tab */}
          <TabsContent value="meeting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Schedule Meeting */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg">Schedule Meeting</CardTitle>
                  <CardDescription>Set a meeting time in your local timezone</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meeting-title" className="text-right whitespace-nowrap">Title</Label>
                      <Input 
                        id="meeting-title" 
                        className="col-span-3" 
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right whitespace-nowrap">Date</Label>
                      <div className="col-span-3">
                        <Calendar
                          mode="single"
                          selected={meetingDate}
                          onSelect={setMeetingDate}
                          className="border rounded-md p-2 sm:p-3"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meeting-time" className="text-right whitespace-nowrap">Time</Label>
                      <div className="col-span-3">
                        <Input 
                          id="meeting-time" 
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Time Zone Comparison */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg">Meeting Time Comparison</CardTitle>
                  <CardDescription>See the meeting time across all time zones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeInfo && meetingTime && meetingDate && (
                      <div className="rounded-md border">
                        <div className="bg-muted px-3 py-2 font-medium border-b text-sm sm:text-base">
                          {meetingTitle} - {meetingDate.toLocaleDateString()}
                        </div>
                        <div className="divide-y">
                          {timeInfo.map((zone, idx) => {
                            const convertedTime = convertTime(
                              meetingTime,
                              meetingDate.toISOString().split('T')[0],
                              userTimezone,
                              zone.timezone
                            );
                            
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 sm:p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg sm:text-xl">{zone.flag}</span>
                                  <span className="font-medium text-sm sm:text-base">{zone.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-sm sm:text-base">
                                    {convertedTime.time}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {convertedTime.date}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {proposalText && (
                      <Card className="mt-4 sm:mt-8">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Meeting Proposal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="whitespace-pre-line bg-muted p-3 rounded-md text-xs sm:text-sm mb-3">
                            {proposalText}
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => copyToClipboard(proposalText)}
                          >
                            <Copy className="h-4 w-4 mr-2" /> Copy Proposal
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}