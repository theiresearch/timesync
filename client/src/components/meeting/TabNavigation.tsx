import { TabType } from '@/types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-neutral-200 mb-6">
      <div className="flex space-x-8">
        <button 
          className={`px-1 py-3 border-b-2 ${
            activeTab === 'scheduler' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300'
          } transition-colors`}
          onClick={() => onTabChange('scheduler')}
        >
          Meeting Scheduler
        </button>
        <button 
          className={`px-1 py-3 border-b-2 ${
            activeTab === 'converter' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300'
          } transition-colors`}
          onClick={() => onTabChange('converter')}
        >
          Time Converter
        </button>
        <button 
          className={`px-1 py-3 border-b-2 ${
            activeTab === 'team' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300'
          } transition-colors`}
          onClick={() => onTabChange('team')}
        >
          Team Management
        </button>
      </div>
    </div>
  );
}
