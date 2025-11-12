
import React, { useState } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { ListingForm } from './components/ListingForm';
import { FindTreasures } from './components/FindTreasures';
import { VideoLister } from './components/VideoLister';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Map);

  const renderContent = () => {
    switch (currentView) {
      case AppView.Map:
        return <MapView />;
      case AppView.List:
        return <ListingForm />;
      case AppView.VideoList:
        return <VideoLister />;
      case AppView.Find:
        return <FindTreasures />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="container mx-auto max-w-4xl p-4">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main className="mt-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
