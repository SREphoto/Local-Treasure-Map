import { Location } from '../types';

export interface User {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
}

export interface SaleItem {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    viewCount?: number; // "Busy" metric
    likes?: number;     // "Busy" metric
    isSold?: boolean;   // New: Routing update trigger
}

export interface GarageSale {
    id: string;
    title: string;
    address: string;
    date: string;
    time: string;
    description: string;
    location: Location;
    images: string[];
    featuredItems: SaleItem[];
    tags: string[];
    host: User;
    activeViewers: number; // Real-time "Busy" metric
}

// Generators and Helpers for "Busy Saturday" Vibe
const NEIGHBORHOODS = [
    { name: 'Mission', lat: 37.76, lng: -122.42 },
    { name: 'Castro', lat: 37.76, lng: -122.435 },
    { name: 'Haight', lat: 37.77, lng: -122.44 },
    { name: 'Sunset', lat: 37.75, lng: -122.48 },
    { name: 'Richmond', lat: 37.78, lng: -122.47 },
    { name: 'Marina', lat: 37.80, lng: -122.44 },
    { name: 'Noe Valley', lat: 37.75, lng: -122.43 },
    { name: 'SoMa', lat: 37.78, lng: -122.40 },
    { name: 'Pacific Heights', lat: 37.79, lng: -122.43 },
    { name: 'Bernal Heights', lat: 37.74, lng: -122.42 }
];

const ITEM_CATEGORIES = ['Furniture', 'Electronics', 'Clothing', 'Toys', 'Tools', 'Antiques', 'Books', 'Music', 'Sports'];
const ADJECTIVES = ['Vintage', 'Mint Condition', 'Rare', 'Antique', 'Retro', 'Modern', 'Cozy', 'Huge', 'Exclusive', 'Must-See'];
const NOUNS = ['Estate Sale', 'Move-Out', 'Garage Sale', 'Yard Sale', 'Collection Clearing', 'Treasure Hunt', 'Downsizing', 'Studio Cleanout'];

const USERS: User[] = [
    { id: 'u1', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=1', rating: 4.8, verified: true },
    { id: 'u2', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4.9, verified: true },
    { id: 'u3', name: 'Jessica Pearson', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5.0, verified: true },
    { id: 'u4', name: 'Harvey Specter', avatar: 'https://i.pravatar.cc/150?u=4', rating: 4.7, verified: true },
    { id: 'u5', name: 'Louis Litt', avatar: 'https://i.pravatar.cc/150?u=5', rating: 4.5, verified: true },
    { id: 'u6', name: 'Donna Paulsen', avatar: 'https://i.pravatar.cc/150?u=6', rating: 5.0, verified: true },
    { id: 'u7', name: 'Rachel Zane', avatar: 'https://i.pravatar.cc/150?u=7', rating: 4.9, verified: true },
    { id: 'u8', name: 'Alex Williams', avatar: 'https://i.pravatar.cc/150?u=8', rating: 4.6, verified: false },
    { id: 'u9', name: 'Samantha Wheeler', avatar: 'https://i.pravatar.cc/150?u=9', rating: 4.8, verified: true },
    { id: 'u10', name: 'Robert Zane', avatar: 'https://i.pravatar.cc/150?u=10', rating: 4.9, verified: true },
];

const IMAGES = [
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1605218427368-9a6b574f884a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1560506840-ec148e82a604?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=400&q=80',
];

const generateSales = (count: number): GarageSale[] => {
    return Array.from({ length: count }).map((_, i) => {
        const neighborhood = NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
        // Randomize location strictly within walking/short drive distance of neighborhood center
        const latOffset = (Math.random() - 0.5) * 0.01; // ~1km spread
        const lngOffset = (Math.random() - 0.5) * 0.01;

        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

        const numItems = 2 + Math.floor(Math.random() * 5);
        const featuredItems = Array.from({ length: numItems }).map((_, j) => ({
            id: `item-${i}-${j}`,
            title: `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${ITEM_CATEGORIES[Math.floor(Math.random() * ITEM_CATEGORIES.length)]} Item`,
            price: 5 + Math.floor(Math.random() * 200),
            category: ITEM_CATEGORIES[Math.floor(Math.random() * ITEM_CATEGORIES.length)],
            image: IMAGES[Math.floor(Math.random() * IMAGES.length)],
            viewCount: Math.floor(Math.random() * 150),
            likes: Math.floor(Math.random() * 50)
        }));

        return {
            id: (i + 1).toString(),
            title: `${adj} ${neighborhood.name} ${noun}`,
            address: `${100 + Math.floor(Math.random() * 899)} ${['Maple', 'Oak', 'Pine', 'Cedar', 'Elm', 'Main', 'Market', 'Valencia', 'Haight'][Math.floor(Math.random() * 9)]} St`,
            date: 'Live Now',
            time: '8:00 AM - 3:00 PM',
            description: 'Join us for a massive clearing of vintage goods, electronics, and more. Prices negotiable!',
            location: {
                latitude: neighborhood.lat + latOffset,
                longitude: neighborhood.lng + lngOffset
            },
            images: [IMAGES[Math.floor(Math.random() * IMAGES.length)]],
            featuredItems,
            tags: [neighborhood.name, featuredItems[0].category, featuredItems[1]?.category || 'Misc'],
            host: USERS[Math.floor(Math.random() * USERS.length)],
            activeViewers: 3 + Math.floor(Math.random() * 25) // Simulate 3-28 people looking right now
        };
    });
};

export const MOCK_GARAGE_SALES: GarageSale[] = generateSales(45); // Generate 45 sales!

export const TRENDING_ITEMS: SaleItem[] = [
    { id: 't1', title: 'Vintage Leica Camera', price: 450, category: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80', viewCount: 245, likes: 89 },
    { id: 't2', title: 'Mid-Century Teak Desk', price: 850, category: 'Furniture', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80', viewCount: 189, likes: 112 },
    { id: 't3', title: '1st Edition Comic Collection', price: 1200, category: 'Collectibles', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=400&q=80', viewCount: 562, likes: 230 },
    { id: 't4', title: 'Neon Bar Sign', price: 120, category: 'Decor', image: 'https://images.unsplash.com/photo-1563245372-f21727322f19?auto=format&fit=crop&w=400&q=80', viewCount: 134, likes: 45 },
];
