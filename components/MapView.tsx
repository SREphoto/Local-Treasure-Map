import React, { useState, useMemo } from 'react';
import { MapPinIcon, SparklesIcon, PlusIcon, CheckIcon, NavigationIcon, ClockIcon, UsersIcon } from './Icons';
import { MOCK_GARAGE_SALES, TRENDING_ITEMS, GarageSale, SaleItem } from '../services/mockData';

// Interactive Map Configuration
// Coordinate bounds for San Francisco (approximate for the static map image)
const MAP_BOUNDS = {
  north: 37.81, // Top (0%)
  south: 37.72, // Bottom (100%)
  west: -122.50, // Left (0%)
  east: -122.38  // Right (100%)
};

const getMarkerPosition = (lat: number, lng: number) => {
  const latPercent = (MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south) * 100;
  const lngPercent = (lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west) * 100;
  return {
    top: `${Math.max(5, Math.min(95, latPercent))}%`,
    left: `${Math.max(5, Math.min(95, lngPercent))}%`
  };
};

// Route Optimization Modes
type RouteMode = 'FASTEST' | 'VALUE';

interface MapViewProps {
  onSaleClick?: (sale: GarageSale) => void;
  onItemClick?: (item: SaleItem) => void;
  onListItemClick?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ onSaleClick, onItemClick, onListItemClick }) => {
  const [route, setRoute] = useState<GarageSale[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>('FASTEST');
  const [soldItems, setSoldItems] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ msg: string, type: 'info' | 'alert' } | null>(null);

  // Simulate a random item being sold (Demo Feature)
  const simulateItemSold = () => {
    if (route.length === 0) {
      setNotification({ msg: "Add stops to route first!", type: 'info' });
      setTimeout(() => setNotification(null), 2000);
      return;
    }

    // Pick a random sale from the route
    const randomSaleIdx = Math.floor(Math.random() * route.length);
    const sale = route[randomSaleIdx];

    // Pick a random item
    if (sale.featuredItems.length > 0) {
      const item = sale.featuredItems[0]; // Simplification for demo
      if (soldItems.has(item.id)) return;

      setSoldItems(prev => new Set(prev).add(item.id));
      setNotification({
        msg: `Alert: ${item.title} at ${sale.address} just SOLD! Rerouting...`,
        type: 'alert'
      });

      // Simulate "Smart Routing" removing user from route if item is gone
      setTimeout(() => {
        setRoute(prev => prev.filter(s => s.id !== sale.id));
        setNotification(null);
      }, 3000);
    }
  };

  const toggleRouteItem = (sale: GarageSale, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoute(prev => {
      const exists = prev.find(s => s.id === sale.id);
      if (exists) return prev.filter(s => s.id !== sale.id);
      return [...prev, sale];
    });
    setShowRoutePanel(true);
  };

  // Simple Haversine distance for routing
  const calculateDistance = (loc1: { latitude: number, longitude: number }, loc2: { latitude: number, longitude: number }) => {
    return Math.sqrt(Math.pow(loc1.latitude - loc2.latitude, 2) + Math.pow(loc1.longitude - loc2.longitude, 2));
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setRoute(prev => {
        let newRoute = [...prev];

        if (routeMode === 'VALUE') {
          // Sort by total potential value (Highest Price First)
          newRoute.sort((a, b) => (b.featuredItems[0]?.price || 0) - (a.featuredItems[0]?.price || 0));
        } else {
          // FASTEST: Nearest Neighbor approximation
          if (newRoute.length > 0) {
            const optimized: GarageSale[] = [];
            const unvisited = [...newRoute];

            // Start with the northernmost sale as the entry point (or user's current location in real app)
            unvisited.sort((a, b) => b.location.latitude - a.location.latitude);
            let current = unvisited.shift()!;
            optimized.push(current);

            while (unvisited.length > 0) {
              // Find nearest to current
              let nearestIdx = 0;
              let minDst = Infinity;

              for (let i = 0; i < unvisited.length; i++) {
                const dst = calculateDistance(current.location, unvisited[i].location);
                if (dst < minDst) {
                  minDst = dst;
                  nearestIdx = i;
                }
              }

              current = unvisited[nearestIdx];
              optimized.push(current);
              unvisited.splice(nearestIdx, 1);
            }
            newRoute = optimized;
          }
        }
        return newRoute;
      });
      setIsOptimizing(false);
    }, 1000);
  };

  const totalSavings = useMemo(() => {
    if (route.length < 2) return 0;
    return (route.length - 1) * 12;
  }, [route]);

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* Live Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in pointer-events-none">
          <div className={`px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md ${notification.type === 'alert' ? 'bg-red-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
            <SparklesIcon className="w-5 h-5" />
            {notification.msg}
          </div>
        </div>
      )}

      {/* Route Builder Panel */}
      {showRoutePanel && route.length > 0 && (
        <div className="fixed bottom-6 right-6 md:right-12 z-50 w-96 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 animate-slide-up flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <NavigationIcon className="w-5 h-5 text-primary" />
              Smart Route
            </h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{route.length} Stops</span>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-secondary p-1 rounded-xl">
            {(['FASTEST', 'VALUE'] as RouteMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setRouteMode(mode)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${routeMode === mode ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                {mode === 'FASTEST' ? '⚡️ Most Efficient' : '💎 High Value'}
              </button>
            ))}
          </div>

          {/* Route List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {route.map((sale, idx) => (
              <div key={sale.id} className="flex items-center gap-3 bg-secondary/30 p-2.5 rounded-xl group relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-[10px] shadow-sm border border-gray-200 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{sale.title}</p>
                </div>
                <button onClick={(e) => toggleRouteItem(sale, e)} className="text-gray-400 hover:text-destructive p-1">&times;</button>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500">
              <span>Est. Value: ${route.reduce((acc, s) => acc + (s.featuredItems[0]?.price || 0), 0)}</span>
              <span className="text-green-600">Savings: {totalSavings}m</span>
            </div>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing || route.length < 2}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-lg hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isOptimizing ? 'Optimizing...' : `Optimize for ${routeMode === 'FASTEST' ? 'Efficiency' : 'Value'}`}
            </button>

            {/* Demo Helper Button */}
            <button onClick={simulateItemSold} className="w-full text-[10px] text-gray-400 font-mono hover:text-destructive transition-colors border border-dashed rounded-lg py-1 hover:border-destructive hover:bg-destructive/5">
              [DEV: Simulate "Item Sold" Event]
            </button>
          </div>
        </div>
      )}

      {/* Hero / Map Section */}
      <div className="glass rounded-3xl p-1 overflow-hidden relative group h-[550px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#e5e7eb] border border-border group-hover:shadow-primary/20 transition-all duration-500">
          {/* Static Map Image */}
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
            alt="Map of local sales"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-all duration-1000 saturate-50 group-hover:saturate-100 scale-105"
          />

          {/* Map Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent pointer-events-none"></div>

          {/* SVG Overlay for Route Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {route.length > 1 && route.map((sale, idx) => {
              if (idx === route.length - 1) return null;
              const nextSale = route[idx + 1];
              const start = getMarkerPosition(sale.location.latitude, sale.location.longitude);
              const end = getMarkerPosition(nextSale.location.latitude, nextSale.location.longitude);

              return (
                <line
                  key={`line-${idx}`}
                  x1={start.left} y1={start.top}
                  x2={end.left} y2={end.top}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  className="animate-dash opacity-80 filter drop-shadow-md"
                />
              );
            })}
          </svg>

          {/* Markers */}
          {MOCK_GARAGE_SALES.map((sale) => {
            const pos = getMarkerPosition(sale.location.latitude, sale.location.longitude);
            const isSelected = route.some(s => s.id === sale.id);
            const routeIndex = route.findIndex(s => s.id === sale.id);
            const isBusy = sale.activeViewers > 15;

            return (
              <div
                key={sale.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker z-20 hover:z-50"
                style={{ top: pos.top, left: pos.left }}
                onClick={() => onSaleClick && onSaleClick(sale)}
              >
                {/* Ping Animation */}
                {(isBusy || isSelected) && (
                  <div className={`absolute inset-0 -m-2 rounded-full animate-ping opacity-75 ${isSelected ? 'bg-primary' : 'bg-destructive'}`}></div>
                )}

                {/* Marker Pin */}
                <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300
                    ${isSelected
                    ? 'bg-primary border-white scale-125 z-40'
                    : isBusy ? 'bg-white border-destructive hover:scale-125' : 'bg-white/90 backdrop-blur-md border-white/50 hover:scale-110'}
                `}>
                  {isSelected ? (
                    <span className="text-white font-bold text-xs">{routeIndex + 1}</span>
                  ) : (
                    <div className={`rounded-full w-2 h-2 ${isBusy ? 'bg-destructive' : 'bg-primary'}`}></div>
                  )}
                </div>

                {/* Tooltip Card */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl opacity-0 group-hover/marker:opacity-100 transition-all duration-200 w-56 text-left border border-white/20 scale-90 group-hover/marker:scale-100 pointer-events-none group-hover/marker:pointer-events-auto z-50 origin-top">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-foreground line-clamp-1 pr-2">{sale.title}</h4>
                    {isBusy && <span className="flex items-center gap-1 text-[10px] text-destructive font-bold bg-destructive/10 px-1.5 py-0.5 rounded-full whitespace-nowrap"><span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse"></span> BUSY</span>}
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <img src={sale.host.avatar} className="w-4 h-4 rounded-full" />
                    <span>Hosted by {sale.host.name}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <UsersIcon className="w-3 h-3 text-primary" /> {sale.activeViewers} viewing now
                  </p>

                  <button
                    onClick={(e) => toggleRouteItem(sale, e)}
                    className={`w-full text-xs font-bold py-2.5 rounded-lg border transition-all flex items-center justify-center gap-1 ${isSelected ? 'bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20' : 'bg-primary text-white border-primary hover:bg-primary/90'}`}
                  >
                    {isSelected ? 'Remove from Route' : <><PlusIcon className="w-3 h-3" /> Add Stop</>}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Live Activity HUD */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-foreground shadow-sm z-30 flex items-center gap-2 group cursor-help">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {MOCK_GARAGE_SALES.reduce((acc, curr) => acc + curr.activeViewers, 0)} Active Treasure Hunters
            <div className="absolute top-full left-0 mt-2 w-48 bg-black/80 text-white text-[10px] p-2 rounded-lg backdrop-blur hidden group-hover:block">
              Real-time data from {MOCK_GARAGE_SALES.length} active sales in your local area.
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white pointer-events-none z-10">
            <h2 className="text-3xl font-heading font-bold mb-1 drop-shadow-md">
              Local Treasure Map
            </h2>
            <p className="text-white/90 text-sm max-w-xl font-medium">
              Optimize your Saturday morning route based on real-time inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Nearby Sales List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-heading font-bold text-foreground flex items-center gap-3">
              Nearby Sales
              <span className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">{MOCK_GARAGE_SALES.length} Found</span>
            </h3>
            <div className="flex gap-2">
              <button className="text-xs font-bold bg-white border px-3 py-1.5 rounded-full hover:bg-secondary transition-colors">Sort by Distance</button>
              <button className="text-xs font-bold bg-white border px-3 py-1.5 rounded-full hover:bg-secondary transition-colors">Filter by Items</button>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_GARAGE_SALES.map((sale) => {
              const isSelected = route.some(s => s.id === sale.id);
              const isBusy = sale.activeViewers > 15;

              return (
                <div
                  key={sale.id}
                  onClick={() => onSaleClick && onSaleClick(sale)}
                  className={`glass p-4 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border relative overflow-hidden rounded-2xl ${isSelected ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/5' : 'border-white/40'}`}
                >
                  {isBusy && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-sm flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> HOT</div>}

                  <div className="sm:w-48 h-32 shrink-0 rounded-xl overflow-hidden relative shadow-md">
                    <img
                      src={sale.images[0]}
                      alt={sale.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <UsersIcon className="w-3 h-3" /> {sale.activeViewers}
                    </div>
                  </div>

                  <div className="flex-1 py-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate pr-2">{sale.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3" /> {sale.address}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleRouteItem(sale, e)}
                        className={`p-2 rounded-full transition-all shrink-0 shadow-sm ${isSelected ? 'bg-primary text-white scale-110' : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110'}`}
                      >
                        {isSelected ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <img src={sale.host.avatar} alt={sale.host.name} className="w-5 h-5 rounded-full border border-white" />
                      <span className="text-xs text-muted-foreground font-medium">Hosted by <span className="text-foreground">{sale.host.name}</span></span>
                      {sale.host.verified && <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded-full font-bold">VERIFIED</span>}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {sale.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-medium bg-white/50 border border-white/20 px-2 py-1 rounded-md text-foreground/70">
                          #{tag}
                        </span>
                      ))}
                      {sale.tags.length > 3 && <span className="text-xs text-muted-foreground self-center">+{sale.tags.length - 3} more</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Items Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground">Trending Items</h3>
          </div>

          <div className="grid gap-4">
            {TRENDING_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className="glass rounded-xl p-3 flex gap-4 hover:bg-white/80 transition-colors cursor-pointer group hover:shadow-md"
              >
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {soldItems.has(item.id) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                      SOLD
                    </div>
                  )}
                  {item.likes && !soldItems.has(item.id) && (
                    <div className="absolute top-1 right-1 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm font-bold">
                      ♥ {item.likes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h5 className={`font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors ${soldItems.has(item.id) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.title}</h5>
                  <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                  {item.viewCount && <p className="text-[10px] text-primary font-bold mb-1">{item.viewCount} people watching</p>}
                  <span className={`font-bold ${soldItems.has(item.id) ? 'text-destructive' : 'text-green-600'}`}>${item.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-primary to-accent text-white text-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="font-bold text-lg mb-2 relative z-10">Selling something?</h4>
            <div className="flex justify-center -space-x-2 mb-3 relative z-10">
              {[1, 2, 3, 4].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-primary bg-gray-200 z-${i * 10}`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=${i + 20})`, backgroundSize: 'cover' }}></div>)}
              <div className="w-8 h-8 rounded-full border-2 border-primary bg-white flex items-center justify-center text-[10px] font-bold text-primary">+42</div>
            </div>
            <p className="text-white/90 text-sm mb-4 relative z-10">Join 150+ neighbors listing items today.</p>
            <button
              onClick={onListItemClick}
              className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-white/90 transition-transform active:scale-95 shadow-lg relative z-10"
            >
              List Item Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
