import { 
  TeamMember, 
  InsertTeamMember,
  Meeting,
  InsertMeeting,
  User,
  InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team Member methods
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Meeting methods
  getAllMeetings(): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teamMembers: Map<number, TeamMember>;
  private meetings: Map<number, Meeting>;
  private userCurrentId: number;
  private teamMemberCurrentId: number;
  private meetingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.teamMembers = new Map();
    this.meetings = new Map();
    this.userCurrentId = 1;
    this.teamMemberCurrentId = 1;
    this.meetingCurrentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleTeamMembers: InsertTeamMember[] = [
      {
        name: "Alex Johnson",
        country: "United States",
        timeZone: "America/New_York",
        flag: "🇺🇸",
        workingHoursStart: "08:00",
        workingHoursEnd: "17:00"
      },
      {
        name: "Emma Davies",
        country: "United Kingdom",
        timeZone: "Europe/London",
        flag: "🇬🇧",
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00"
      },
      {
        name: "Hiroshi Tanaka",
        country: "Japan",
        timeZone: "Asia/Tokyo",
        flag: "🇯🇵",
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00"
      },
      {
        name: "Sarah Miller",
        country: "Australia",
        timeZone: "Australia/Sydney",
        flag: "🇦🇺",
        workingHoursStart: "08:30",
        workingHoursEnd: "17:30"
      }
    ];

    sampleTeamMembers.forEach(member => {
      this.createTeamMember(member);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Team Member methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberCurrentId++;
    const createdAt = new Date().toISOString();
    const teamMember: TeamMember = { ...insertTeamMember, id, createdAt };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  async updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existing = this.teamMembers.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: TeamMember = { ...existing, ...teamMember };
    this.teamMembers.set(id, updated);
    return updated;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Meeting methods
  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values());
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingCurrentId++;
    const createdAt = new Date().toISOString();
    const meeting: Meeting = { ...insertMeeting, id, createdAt };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const existing = this.meetings.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Meeting = { ...existing, ...meeting };
    this.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }
}

export const storage = new MemStorage();
