import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MeetingDetails from '@/components/meeting/MeetingDetails';
import TimeZoneList from '@/components/meeting/TimeZoneList';
import ScheduleGrid from '@/components/meeting/ScheduleGrid';
import MeetingProposal from '@/components/meeting/MeetingProposal';
import TabNavigation from '@/components/meeting/TabNavigation';
import { TimeZoneProvider } from '@/context/TimeZoneContext';
import { TabType } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('scheduler');
  
  return (
    <TimeZoneProvider>
      <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Team Time Zone Coordinator</h1>
            <p className="text-neutral-500">Schedule meetings across different time zones with ease</p>
          </div>
          
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          {activeTab === 'scheduler' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MeetingDetails 
                  meetingDetails={{
                    title: 'Weekly Team Sync',
                    date: new Date().toISOString().split('T')[0],
                    duration: 60,
                    workingHoursStart: '08:00',
                    workingHoursEnd: '18:00',
                  }}
                  onUpdate={() => {}}
                />
                <TimeZoneList />
              </div>
              
              <div className="lg:col-span-2">
                <ScheduleGrid />
                <MeetingProposal />
              </div>
            </div>
          )}
          
          {activeTab === 'converter' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Time Zone Converter</h2>
              <p className="text-neutral-500">
                This feature is coming soon. Stay tuned for updates!
              </p>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Team Management</h2>
              <p className="text-neutral-500">
                This feature is coming soon. Stay tuned for updates!
              </p>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </TimeZoneProvider>
  );
}
