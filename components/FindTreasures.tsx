import React, { useState } from 'react';
import { BellIcon, SearchIcon, TrashIcon, SparklesIcon } from './Icons';

interface ISOMatch {
    id: string;
    title: string;
    price: number;
    matchScore: number;
    imageUrl: string;
    distance: string;
    foundAt: string;
}

interface ISORequest {
    id: string;
    query: string;
    minPrice?: number;
    maxPrice?: number;
    radius: number; // in miles
    isActive: boolean;
    matches: ISOMatch[];
    lastChecked: string;
}

const MOCK_MATCH: ISOMatch = {
    id: 'm1',
    title: 'Vintage Mid-Century Floor Lamp',
    price: 45,
    matchScore: 98,
    imageUrl: 'https://images.unsplash.com/photo-1513506003013-19c6cd84e12e?auto=format&fit=crop&w=400&q=80',
    distance: '1.2 mi',
    foundAt: '2 mins ago'
};

export const FindTreasures: React.FC = () => {
    const [requests, setRequests] = useState<ISORequest[]>([]);
    const [newQuery, setNewQuery] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [showNotification, setShowNotification] = useState<ISOMatch | null>(null);

    const handleCreateRequest = () => {
        if (!newQuery.trim()) return;

        const newRequest: ISORequest = {
            id: Date.now().toString(),
            query: newQuery,
            radius: 5,
            isActive: true,
            matches: [],
            lastChecked: 'Just now'
        };

        setRequests(prev => [newRequest, ...prev]);
        setNewQuery('');

        // Simulate a "Background Search" finding a match after 3 seconds
        setSimulating(true);
        setTimeout(() => {
            setRequests(prev => prev.map(req =>
                req.id === newRequest.id
                    ? { ...req, matches: [MOCK_MATCH], lastChecked: 'Background search complete' }
                    : req
            ));
            setShowNotification(MOCK_MATCH);
            setSimulating(false);

            // Hide notification toast after 4s
            setTimeout(() => setShowNotification(null), 4000);
        }, 3000);
    };

    const handleDelete = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="flex flex-col h-[75vh] glass rounded-3xl shadow-2xl animate-fade-in overflow-hidden border border-white/20 relative">

            {/* Notification Toast (Simulated Push Notification) */}
            {showNotification && (
                <div className="absolute top-4 right-4 z-50 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-primary/20 max-w-sm animate-slide-in-right cursor-pointer hover:scale-105 transition-transform">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-full shrink-0">
                            <BellIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-foreground">Match Found!</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Found <span className="font-bold text-primary">{showNotification.title}</span> near you for ${showNotification.price}.
                            </p>
                            <div className="mt-2 text-xs font-bold text-primary">Tap to view details</div>
                        </div>
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary">
                            <img src={showNotification.imageUrl} alt="Match" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border-b border-white/20">
                <div className="max-w-2xl mx-auto text-center mb-8">
                    <span className="inline-block p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
                        <SparklesIcon className="w-8 h-8" />
                    </span>
                    <h2 className="text-3xl font-heading font-bold text-foreground mb-2">In Search Of (ISO)</h2>
                    <p className="text-muted-foreground text-lg">
                        Tell us what you're looking for. We'll scan every new garage sale listing in real-time and alert you instantly when we find a match.
                    </p>
                </div>

                <div className="max-w-xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center bg-white rounded-full shadow-lg p-2 pr-2 border border-border focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                        <div className="pl-4 text-muted-foreground">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            className="flex-1 bg-transparent p-3 outline-none text-foreground placeholder:text-muted-foreground/70"
                            placeholder="e.g. 'Vintage typewriter' or 'Nintendo Switch'"
                            value={newQuery}
                            onChange={(e) => setNewQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateRequest()}
                        />
                        <button
                            onClick={handleCreateRequest}
                            disabled={!newQuery.trim() || simulating}
                            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                        >
                            {simulating ? 'Scanning...' : 'Create Alert'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-bold text-xl text-foreground">Your Active Alerts</h3>
                        <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-muted-foreground border border-white/20">
                            {requests.length} Active
                        </span>
                    </div>

                    {requests.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl bg-white/20">
                            <p className="text-muted-foreground">No active search alerts. Try creating one above!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-secondary rounded-xl text-primary">
                                                <BellIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-foreground">{req.query}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium border border-green-100">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                        Active
                                                    </span>
                                                    <span>Radius: {req.radius} mi</span>
                                                    <span>•</span>
                                                    <span>Last checked: {req.lastChecked}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            {req.matches.length > 0 ? (
                                                <button className="bg-accent/10 text-accent font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-accent/20 transition-colors">
                                                    <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{req.matches.length}</span>
                                                    View Matches
                                                </button>
                                            ) : (
                                                <div className="px-4 py-2 text-xs font-medium text-muted-foreground italic flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                    Scanning...
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                                title="Delete Alert"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Matches Preview Area */}
                                    {req.matches.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Latest Match</p>
                                            <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-xl border border-white/50">
                                                <img src={req.matches[0].imageUrl} className="w-16 h-16 rounded-lg object-cover" alt={req.matches[0].title} />
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-sm truncate">{req.matches[0].title}</h5>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <span className="font-bold text-green-600">${req.matches[0].price}</span>
                                                        <span>•</span>
                                                        <span>{req.matches[0].distance} away</span>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">{req.matches[0].matchScore}% Match</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
