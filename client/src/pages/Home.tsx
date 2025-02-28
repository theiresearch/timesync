import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";

import { timezones, convertTime, getActualUtcOffset } from "../utils/timeUtils";
import { getCountryFlag } from "../utils/formatUtils";
import {
  PlusCircle,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  Copy,
} from "lucide-react";

export default function Home() {
  // User timezone state
  const [userTimezone, setUserTimezone] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  // Additional time zones state
  const [timeZones, setTimeZones] = React.useState([
    { id: 1, timezone: "Europe/London", flag: "🇬🇧" },
    { id: 2, timezone: "America/New_York", flag: "🇺🇸" },
  ]);

  // New time zone form state
  const [newTimeZone, setNewTimeZone] = React.useState("");

  // Meeting state
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(
    new Date(),
  );
  const [meetingTime, setMeetingTime] = React.useState("09:00");
  const [meetingLink, setMeetingLink] = React.useState("");

  // Meeting proposal state
  const [generatedText, setGeneratedText] = React.useState("");
  const [editableProposal, setEditableProposal] = React.useState("");

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
          flag: countryFlag,
        },
      ]);

      // Display success toast
      toast({
        title: "Time zone added",
        description: `New time zone has been added.`,
        variant: "default",
      });

      // Reset form
      setNewTimeZone("");
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
    setTimeZones(timeZones.filter((tz) => tz.id !== id));

    toast({
      title: "Time zone removed",
      description: "Time zone has been removed from your list.",
      variant: "default",
    });
  };

  // Generate meeting proposal message in plain text format with 24h time
  const generateMeetingProposal = () => {
    if (!meetingDate || !meetingTime) return;

    const formattedDate = meetingDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, ".");

    let proposal = `📅 Meeting Proposal\n\n`;

    // Meeting link if provided
    if (meetingLink) {
      proposal += `🔗 ${meetingLink}\n\n`;
    }

    // Reference time (user's timezone)
    const tzInfo = timezones.find((tz) => tz.value === userTimezone);
    const tzDisplay = tzInfo ? tzInfo.name : userTimezone;
    const refFlag = getCountryFlag(userTimezone);

    proposal += `${refFlag} ${tzDisplay}: ${formattedDate} ${meetingTime}\n\n`;

    // Other timezones
    timeZones.forEach((zone) => {
      const convertedTime = convertTime(
        meetingTime,
        meetingDate.toISOString().split("T")[0],
        userTimezone,
        zone.timezone,
      );

      const tzInfo = timezones.find((tz) => tz.value === zone.timezone);
      const tzDisplay = tzInfo ? tzInfo.name : zone.timezone;

      proposal += `${zone.flag} ${tzDisplay}: ${convertedTime.date} ${convertedTime.time}\n`;
    });

    setGeneratedText(proposal);
    setEditableProposal(proposal);
  };

  // Get timezone info
  const getDisplayTimeForZone = (timezone: string) => {
    if (!meetingDate || !meetingTime) return null;

    const formattedDate = meetingDate.toISOString().split("T")[0];
    const convertedTime = convertTime(
      meetingTime,
      formattedDate,
      userTimezone,
      timezone,
    );

    return convertedTime;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Meeting proposal has been copied.",
          variant: "default",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/favicon.svg"
              alt="The I Research Logo"
              className="w-8 h-8 object-cover rounded"
            />
            <span className="text-xl font-semibold">TimeSync</span>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white dark:bg-gray-950 mt-16">
        <div className="mb-8">
          <p className="text-sm sm:text-base text-neutral-500">
            Coordinate meetings across global time zones
          </p>
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
                <div className="flex justify-between items-center border rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getCountryFlag(userTimezone)}
                    </span>
                    <div>
                      <div className="font-medium">
                        {timezones.find((tz) => tz.value === userTimezone)
                          ?.name || userTimezone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        UTC{getActualUtcOffset(userTimezone, meetingDate ? new Date(meetingDate) : undefined)}
                      </div>
                      {meetingDate && meetingTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {meetingDate
                            .toISOString()
                            .split("T")[0]
                            .replace(/-/g, ".")}{" "}
                          {meetingTime}
                        </div>
                      )}
                    </div>
                  </div>
                  <Select value={userTimezone} onValueChange={setUserTimezone}>
                    <SelectTrigger className="w-[40px] h-[40px] p-0 rounded-full border-none shadow-none bg-transparent hover:bg-muted focus:ring-0 focus:ring-offset-0">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="sr-only">Change timezone</span>
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.id || tz.value} value={tz.value}>
                          {getCountryFlag(tz.value)} {tz.name} <span className="text-xs text-muted-foreground ml-1">(UTC{getActualUtcOffset(tz.value, meetingDate ? new Date(meetingDate) : undefined)})</span>
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
                {timeZones.map((zone) => {
                  const tzInfo = timezones.find(
                    (tz) => tz.value === zone.timezone,
                  );
                  const displayName = tzInfo ? tzInfo.name : zone.timezone;
                  const utcOffset = getActualUtcOffset(zone.timezone, meetingDate ? new Date(meetingDate) : undefined);

                  // Show converted time if meeting date and time are selected
                  const convertedTime =
                    meetingDate && meetingTime
                      ? getDisplayTimeForZone(zone.timezone)
                      : null;

                  return (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-2 sm:p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{zone.flag}</span>
                        <div>
                          <div className="font-medium">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            UTC{utcOffset}
                          </div>
                          {convertedTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {convertedTime.date.replace(/-/g, ".")}{" "}
                              {convertedTime.time}
                            </div>
                          )}
                        </div>
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
                  <h3 className="font-medium mb-2 text-sm sm:text-base">
                    Add New Time Zone
                  </h3>
                  <div className="flex gap-2">
                    <Select value={newTimeZone} onValueChange={setNewTimeZone}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.id || tz.value} value={tz.value}>
                            {getCountryFlag(tz.value)} {tz.name} <span className="text-xs text-muted-foreground ml-1">(UTC{getActualUtcOffset(tz.value, meetingDate ? new Date(meetingDate) : undefined)})</span>
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
            <CardDescription>Set when your meeting occurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meeting-date" className="block mb-2">
                        Date (YYYY.MM.DD)
                      </Label>
                      {/* Native date picker with formatted display */}
                      <div className="relative">
                        <Input
                          id="meeting-date"
                          type="date"
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          value={
                            meetingDate
                              ? meetingDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setMeetingDate(
                              e.target.value
                                ? new Date(e.target.value)
                                : undefined,
                            )
                          }
                        />
                        <Input
                          readOnly
                          value={
                            meetingDate
                              ? meetingDate
                                  .toISOString()
                                  .split("T")[0]
                                  .replace(/-/g, ".")
                              : "Select date..."
                          }
                          className="pointer-events-none border pr-8"
                        />
                        <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="meeting-time" className="block mb-2">
                        Time
                      </Label>
                      <Input
                        id="meeting-time"
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meeting-link" className="block mb-2">
                      Meeting Link (optional)
                    </Label>
                    <Input
                      id="meeting-link"
                      placeholder="Zoom, Google Meet, etc."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleGenerateTimes}>
                    Generate Proposal
                  </Button>
                </div>
              </div>

              <div>
                {generatedText ? (
                  <div>
                    <Label htmlFor="proposal" className="block mb-2">
                      Meeting Proposal
                    </Label>
                    <Textarea
                      id="proposal"
                      className="h-[200px] font-mono text-sm"
                      value={editableProposal}
                      onChange={(e) => setEditableProposal(e.target.value)}
                    />
                    <Button
                      className="w-full mt-2"
                      onClick={() => copyToClipboard(editableProposal)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy Proposal
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Clock className="mx-auto h-12 w-12 mb-2 opacity-20" />
                      <p>Fill in meeting details and generate a proposal</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer - Center Aligned */}
      <footer className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs text-muted-foreground">
              {new Date().getFullYear()} The I Research
            </span>
            <div className="flex gap-4 items-center">
              <a
                href="https://x.com/theiresearch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/theiresearch/timesync"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
              </a>
              <a
                href="http://timesync.theiresearch.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                <div className="h-4 w-4 rounded-[1px] overflow-hidden flex items-center justify-center">
                  <img
                    src="/favicon.svg"
                    alt="The I Research"
                    className="h-4 w-4 object-cover"
                  />
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
