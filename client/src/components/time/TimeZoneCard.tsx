import { TeamMemberWithLocalTime } from '@/types';
import { formatWorkingHours } from '@/utils/formatUtils';

interface TimeZoneCardProps {
  member: TeamMemberWithLocalTime;
  onRemove?: (id: number) => void;
}

export default function TimeZoneCard({ member, onRemove }: TimeZoneCardProps) {
  return (
    <div className="timezone-card bg-white border border-neutral-200 rounded-md p-4 mb-3 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-1">
            <span className="mr-2">{member.flag}</span>
            <h3 className="font-medium">{member.name}</h3>
          </div>
          <p className="text-sm text-neutral-500">
            {member.country} ({member.timeZone.split('/').pop()})
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{member.localTime}</p>
          <p className="text-sm text-neutral-500">{member.localDate}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center text-sm text-neutral-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 mr-1 ${member.isWorkingHours ? 'text-secondary' : 'text-accent'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Working hours: {formatWorkingHours(member.workingHoursStart, member.workingHoursEnd)}</span>
        </div>
        
        {onRemove && (
          <button 
            onClick={() => onRemove(member.id)}
            className="text-neutral-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
