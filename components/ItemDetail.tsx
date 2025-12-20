import React from 'react';
import { SaleItem } from '../types';

interface ItemDetailProps {
    item: SaleItem;
    onBack: () => void;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ item, onBack }) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center text-primary font-bold hover:underline mb-4"
            >
                ← Back
            </button>

            <div className="glass rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {/* Image Side */}
                <div className="md:w-1/2 relative h-96 md:h-auto bg-black">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Details Side */}
                <div className="md:w-1/2 p-8 flex flex-col justify-between bg-white/50 backdrop-blur-md">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-1">{item.category}</h2>
                                <h1 className="text-3xl font-heading font-bold text-foreground leading-tight">{item.title}</h1>
                            </div>
                            <span className="text-2xl font-bold text-primary">${item.price}</span>
                        </div>

                        <div className="w-full h-px bg-border my-6"></div>

                        <h3 className="font-bold text-foreground mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {item.description || "No description provided for this item. Contact the seller for more details."}
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1">
                            Message Seller
                        </button>
                        <button className="w-full border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary/5 transition-colors">
                            Make an Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
