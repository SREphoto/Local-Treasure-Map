import React, { useState } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { ListingForm } from './components/ListingForm';
import { FindTreasures } from './components/FindTreasures';
import { VideoLister } from './components/VideoLister';
import { SaleDetail } from './components/SaleDetail';
import { ItemDetail } from './components/ItemDetail';
import { AppView, GarageSale, SaleItem } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Map);
  const [selectedSale, setSelectedSale] = useState<GarageSale | null>(null);
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null);

  const handleSaleClick = (sale: GarageSale) => {
    setSelectedSale(sale);
    setCurrentView(AppView.SaleDetail);
  };

  const handleItemClick = (item: SaleItem) => {
    setSelectedItem(item);
    setCurrentView(AppView.ItemDetail);
  };

  const handleListItemClick = () => {
    setCurrentView(AppView.List);
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.Map:
        return <MapView onSaleClick={handleSaleClick} onItemClick={handleItemClick} onListItemClick={handleListItemClick} />;
      case AppView.List:
        return <ListingForm />;
      case AppView.VideoList:
        return <VideoLister />;
      case AppView.Find:
        return <FindTreasures />;
      case AppView.SaleDetail:
        return selectedSale ? (
          <SaleDetail
            sale={selectedSale}
            onBack={() => setCurrentView(AppView.Map)}
            onItemClick={handleItemClick}
          />
        ) : <MapView onSaleClick={handleSaleClick} onItemClick={handleItemClick} onListItemClick={handleListItemClick} />;
      case AppView.ItemDetail:
        return selectedItem ? (
          <ItemDetail
            item={selectedItem}
            onBack={() => setCurrentView(AppView.Map)}
          />
        ) : <MapView onSaleClick={handleSaleClick} onItemClick={handleItemClick} onListItemClick={handleListItemClick} />;
      default:
        return <MapView onSaleClick={handleSaleClick} onItemClick={handleItemClick} onListItemClick={handleListItemClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <div className="relative container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main className="mt-8 animate-slide-up">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
