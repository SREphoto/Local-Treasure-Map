
import React from 'react';
import { AppView } from '../types';
import { MapIcon, ListIcon, FindIcon, VideoIcon } from './Icons';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: AppView.Map, label: 'Map View', icon: <MapIcon /> },
    { view: AppView.List, label: 'List an Item', icon: <ListIcon /> },
    { view: AppView.VideoList, label: 'Video Lister', icon: <VideoIcon /> },
    { view: AppView.Find, label: 'Find Treasures', icon: <FindIcon /> },
  ];

  return (
    <header className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 sm:mb-0">
          Local Treasures
        </h1>
        <nav className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
