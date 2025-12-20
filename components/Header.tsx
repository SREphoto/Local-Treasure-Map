import React from 'react';
import { AppView } from '../types';
import { MapIcon, ListIcon, FindIcon, VideoIcon, SparklesIcon } from './Icons';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: AppView.Map, icon: MapIcon, label: 'Map' },
    { view: AppView.List, icon: ListIcon, label: 'List Item' },
    { view: AppView.VideoList, icon: VideoIcon, label: 'Video List' },
    { view: AppView.Find, icon: FindIcon, label: 'Find Treasures' },
  ];

  return (
    <header className="sticky top-4 z-50 mb-8">
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-2xl hover:bg-white/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg text-white animate-pulse-slow">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-gradient tracking-tight">
              Local Treasures
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              AI-Powered Marketplace
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl backdrop-blur-sm">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${currentView === item.view
                  ? 'bg-white text-primary shadow-md scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'}
              `}
            >
              <item.icon />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
