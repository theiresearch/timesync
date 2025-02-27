import React, { useState } from 'react';
import { Link } from 'wouter';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

import Header from '../components/Header';
import Footer from '../components/Footer';

import { timezones, getCurrentTimeInTimezone, convertTime } from '@/utils/timeUtils';
import { getCountryFlag } from '@/utils/formatUtils';
import { PlusCircle, Clock, Calendar as CalendarIcon, Trash2, Copy } from 'lucide-react';

export default function Home() {
  // User timezone state
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Additional time zones state
  const [timeZones, setTimeZones] = useState([
    { id: 1, timezone: 'Europe/London', flag: '🇬🇧' },
    { id: 2, timezone: 'America/New_York', flag: '🇺🇸' }
  ]);
  
  // New time zone form state
  const [newTimeZone, setNewTimeZone] = useState('');
  
  // Meeting state
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date());
  const [meetingTime, setMeetingTime] = useState('09:00');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Meeting proposal state
  const [generatedText, setGeneratedText] = useState('');
  const [editableProposal, setEditableProposal] = useState('');
  
  const { toast } = useToast();
  
  // Add new timezone
  const handleAddTimeZone = () => {
    if (newTimeZone) {
      // Get flag emoji based on timezone
      const countryFlag = getCountryFlag(newTimeZone);
      
      setTimeZones([
        ...timeZones,
        {
          id: Date.now(),
          timezone: newTimeZone,
          flag: countryFlag
        }
      ]);
      
      // Display success toast
      toast({
        title: "Time zone added",
        description: `New time zone has been added.`,
        variant: "default",
      });
      
      // Reset form
      setNewTimeZone('');
    } else {
      // Display error toast if no timezone selected
      toast({
        title: "Missing information",
        description: "Please select a time zone.",
        variant: "destructive",
      });
    }
  };
  
  // Remove timezone
  const handleRemoveTimeZone = (id: number) => {
    setTimeZones(timeZones.filter(tz => tz.id !== id));
    
    toast({
      title: "Time zone removed",
      description: "Time zone has been removed from your list.",
      variant: "default",
    });
  };
  
  // Generate meeting proposal message in plain text format with 24h time
  const generateMeetingProposal = () => {
    if (!meetingDate || !meetingTime) return;
    
    const formattedDate = meetingDate.toISOString().split('T')[0];
    const formattedMeetingDate = meetingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    
    let proposal = `📅 Meeting Proposal for ${formattedMeetingDate}\n\n`;
    
    // Meeting link if provided
    if (meetingLink) {
      proposal += `🔗 ${meetingLink}\n\n`;
    }
    
    // Reference time (user's timezone)
    const tzInfo = timezones.find(tz => tz.value === userTimezone);
    const tzDisplay = tzInfo ? tzInfo.name : userTimezone;
    proposal += `Your time (${tzDisplay}):\n🕒 ${meetingTime}\n\n`;
    
    // Other timezones
    proposal += `Other time zones:\n`;
    
    timeZones.forEach(zone => {
      const convertedTime = convertTime(
        meetingTime,
        formattedDate,
        userTimezone,
        zone.timezone
      );
      
      const tzInfo = timezones.find(tz => tz.value === zone.timezone);
      const tzDisplay = tzInfo ? tzInfo.name : zone.timezone;
      
      proposal += `${zone.flag} ${tzDisplay}: ${convertedTime.time}\n`;
    });
    
    setGeneratedText(proposal);
    setEditableProposal(proposal);
  };
  
  // Generate meeting times table for all zones
  const generateTimeTable = () => {
    if (!meetingDate || !meetingTime) return null;
    
    const formattedDate = meetingDate.toISOString().split('T')[0];
    const timeInfo = [];
    
    // Add user's timezone
    const tzInfo = timezones.find(tz => tz.value === userTimezone);
    timeInfo.push({
      timezone: userTimezone,
      displayName: tzInfo ? tzInfo.name : userTimezone,
      flag: '🏠',
    });
    
    // Add other timezones
    timeZones.forEach(zone => {
      const tzInfo = timezones.find(tz => tz.value === zone.timezone);
      timeInfo.push({
        timezone: zone.timezone,
        displayName: tzInfo ? tzInfo.name : zone.timezone,
        flag: zone.flag,
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
  
  const handleGenerateTimes = () => {
    generateMeetingProposal();
  };
  
  const timeInfo = generateTimeTable();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">TimeSync</h1>
          <p className="text-sm sm:text-base text-neutral-500">Coordinate meetings across time zones</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Your Timezone */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg">Reference Time Zone</CardTitle>
              <CardDescription>Set your base time zone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timezone" className="text-right whitespace-nowrap">Time Zone</Label>
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
                          {getCountryFlag(tz.value)} {tz.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Time Zones List */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg">Additional Time Zones</CardTitle>
              <CardDescription>Add time zones to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeZones.map(zone => {
                  const tzInfo = timezones.find(tz => tz.value === zone.timezone);
                  const displayName = tzInfo ? tzInfo.name : zone.timezone;
                  
                  return (
                    <div key={zone.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{zone.flag}</span>
                        <span className="font-medium">{displayName}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveTimeZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Add New Time Zone</h3>
                  <div className="flex gap-2">
                    <Select 
                      value={newTimeZone} 
                      onValueChange={setNewTimeZone}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {getCountryFlag(tz.value)} {tz.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTimeZone}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Meeting Settings */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg">Meeting Details</CardTitle>
            <CardDescription>Set your meeting time and generate a proposal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="block mb-2">Date</Label>
                <Calendar
                  mode="single"
                  selected={meetingDate}
                  onSelect={setMeetingDate}
                  className="border rounded-md p-2"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meeting-time" className="block mb-2">Time</Label>
                  <Input 
                    id="meeting-time" 
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meeting-link" className="block mb-2">Meeting Link (optional)</Label>
                  <Input 
                    id="meeting-link" 
                    placeholder="Zoom, Google Meet, etc."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
                
                <Button className="w-full" onClick={handleGenerateTimes}>
                  Generate Times
                </Button>
              </div>
              
              <div>
                {generatedText && (
                  <>
                    <Label htmlFor="proposal" className="block mb-2">Meeting Proposal</Label>
                    <Textarea
                      id="proposal"
                      className="h-[250px] font-mono text-sm"
                      value={editableProposal}
                      onChange={(e) => setEditableProposal(e.target.value)}
                    />
                    <Button 
                      className="w-full mt-2" 
                      onClick={() => copyToClipboard(editableProposal)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy Proposal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Time Zone Comparison */}
        {timeInfo && generatedText && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg">Time Comparison</CardTitle>
              <CardDescription>Meeting time across all time zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted px-3 py-2 font-medium border-b text-sm sm:text-base">
                  {meetingDate?.toLocaleDateString()} at {meetingTime}
                </div>
                <div className="divide-y">
                  {timeInfo.map((zone, idx) => {
                    const convertedTime = convertTime(
                      meetingTime,
                      meetingDate?.toISOString().split('T')[0] || '',
                      userTimezone,
                      zone.timezone
                    );
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 sm:p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl">{zone.flag}</span>
                          <span className="font-medium text-sm sm:text-base">{zone.displayName}</span>
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
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}