'use client';

import { useState } from 'react';
import { Compass, MapPin, TrendingUp } from 'lucide-react';
import JourneysTab from './JourneysTab';
import TrendingTab from './TrendingTab';

const tabs = [
  { id: 'journeys', label: 'Journeys', icon: MapPin },
  { id: 'trending', label: 'Trending Destinations', icon: TrendingUp },
];

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] = useState('journeys');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Compass className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold">Website Content</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-10">
          Manage journey packages, pricing, itineraries and trending destinations on the ImagicaHolidays website.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'journeys' && <JourneysTab />}
      {activeTab === 'trending' && <TrendingTab />}
    </div>
  );
}
