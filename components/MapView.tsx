
import React from 'react';
import { MapPinIcon } from './Icons';

export const MapView: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Discover Treasures Near You
        </h2>
        <p className="text-gray-600 mb-6">
          Explore local garage sales, estate sales, and community listings on our interactive map.
        </p>
      </div>
      <div className="relative rounded-lg overflow-hidden shadow-lg aspect-w-16 aspect-h-9 bg-gray-200">
        <img
          src="https://picsum.photos/seed/localtreasuresmap/1200/600"
          alt="Map of local sales"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-center text-white p-4 bg-black bg-opacity-50 rounded-lg">
            <MapPinIcon className="mx-auto h-12 w-12 text-blue-300" />
            <h3 className="text-xl font-semibold mt-2">Interactive Map Coming Soon</h3>
            <p className="text-sm">Use the "Find Treasures" tab to search for items!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
