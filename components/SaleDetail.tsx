import React from 'react';
import { GarageSale } from '../types';
import { MapPinIcon, LocationIcon } from './Icons';

interface SaleDetailProps {
    sale: GarageSale;
    onBack: () => void;
    onItemClick: (item: any) => void;
}

export const SaleDetail: React.FC<SaleDetailProps> = ({ sale, onBack, onItemClick }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <button
                onClick={onBack}
                className="flex items-center text-primary font-bold hover:underline mb-4"
            >
                ← Back to Map
            </button>

            {/* Sale Hero */}
            <div className="glass rounded-3xl overflow-hidden shadow-xl">
                <div className="relative h-64 md:h-80">
                    <img
                        src={sale.images[0]}
                        alt={sale.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {sale.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-bold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">{sale.title}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/90">
                            <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {sale.address}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="font-bold text-accent">{sale.date} @ {sale.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-heading font-bold text-foreground mb-4">About the Sale</h3>
                        <p className="text-muted-foreground leading-relaxed">{sale.description}</p>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-heading font-bold text-foreground mb-4">Featured Items</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {sale.featuredItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => onItemClick(item)}
                                    className="group cursor-pointer rounded-xl bg-secondary/30 p-2 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h4>
                                    <p className="text-primary font-bold text-sm">${item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6 flex flex-col gap-4">
                        <div className="w-full h-48 bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
                            {/* Mock Map */}
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4194,37.7749,12,0/400x400')] bg-cover opacity-50"></div>
                            <div className="z-10 bg-white/90 p-2 rounded-full shadow-lg">
                                <LocationIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <LocationIcon className="w-5 h-5" /> Get Directions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
