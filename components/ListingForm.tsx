import React, { useState, useCallback, useRef } from 'react';
import { generateListingDetails } from '../services/geminiService';
import { SparklesIcon, UploadIcon, CheckCircleIcon, BrainIcon } from './Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const COMMON_CATEGORIES = [
    'Furniture', 'Electronics', 'Clothing', 'Home Goods', 'Books', 'Toys & Games', 'Sports & Outdoors', 'Antiques', 'Collectibles'
];

export const ListingForm: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    // State for AI Simulation
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');

    const [isPublished, setIsPublished] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setIsPublished(false);
        setIsEditing(false);
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('');

        // Trigger Real AI Analysis
        await analyzeImage(file);
    };

    const analyzeImage = async (file: File) => {
        setIsScanning(true);
        setScanProgress(10);
        setScanStatus('Initializing AI Vision...');

        try {
            const base64 = await fileToBase64(file);
            setScanProgress(30);
            setScanStatus('Analyzing image pixels...');

            const result = await generateListingDetails(base64, file.type);
            setScanProgress(70);
            setScanStatus('Drafting listing details...');

            if (result) {
                setTitle(result.title || '');
                setDescription(result.description || '');
                setPrice(result.price?.toString() || '');
                setCategory(result.category || '');
            }

            setScanProgress(100);
            setScanStatus('Complete!');
            setTimeout(() => setIsScanning(false), 500); // Short delay to show 100%

        } catch (error) {
            console.error("AI Analysis Failed:", error);
            setScanStatus('Analysis failed. Please try again.');
            setIsScanning(false);
            // Optional: Show error toast
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublished(true);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    return (
        <div className="glass rounded-3xl p-8 animate-fade-in max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="mb-8 border-b border-border pb-6 relative z-10">
                <h2 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                    {isPublished ? (
                        <>
                            <span className="text-green-500"><CheckCircleIcon className="w-8 h-8" /></span>
                            Listing Published
                        </>
                    ) : (
                        <>
                            AI Listing Assistant
                            <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-1 rounded-full uppercase tracking-wider font-bold">Beta</span>
                        </>
                    )}
                </h2>
                <p className="text-muted-foreground text-lg">
                    {isPublished
                        ? 'Your item is now live on the Local Treasure Map.'
                        : 'Drop a photo and watch our AI instantly draft your listing.'}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 relative z-10">
                {/* Image Upload / Scan Section */}
                <div className="space-y-6">
                    <div
                        className={`
                            relative h-[400px] rounded-3xl overflow-hidden transition-all duration-500 border-4 
                            ${isScanning ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]' : 'border-dashed border-border hover:border-primary/50 hover:bg-secondary/30'}
                            bg-white/50 backdrop-blur-sm group cursor-pointer
                        `}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onClick={() => !imagePreview && fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Item preview" className="w-full h-full object-cover" />

                                {/* Scanning Overlay */}
                                {isScanning && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                        <div className="w-24 h-24 mb-6 relative">
                                            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                                            <div
                                                className="absolute inset-0 border-4 border-t-primary border-r-primary rounded-full animate-spin"
                                                style={{ borderTopColor: '#facc15', borderRightColor: '#facc15' }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                                {scanProgress}%
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">{scanStatus}</h3>
                                        <p className="text-white/70">Analyzing pixels & metadata...</p>

                                        {/* Scanner Line Animation */}
                                        <div className="absolute inset-0 w-full h-[2px] bg-primary shadow-[0_0_15px_#facc15] animate-scan opacity-70"></div>
                                    </div>
                                )}

                                {/* Overlay Controls */}
                                {!isScanning && !isPublished && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                            className="bg-white text-foreground font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <BrainIcon className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Drag & Drop Photo</h3>
                                <p className="text-muted-foreground mb-6">or click to browse</p>
                                <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    <SparklesIcon className="w-3 h-3" />
                                    AI-Powered Auto-Fill
                                </span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-500 ${isScanning ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
                    <div className="space-y-2">
                        <label htmlFor="title" className="flex items-center justify-between text-sm font-semibold text-foreground">
                            Title
                            {title && !isScanning && <span className="text-xs text-primary flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> AI Generated</span>}
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Upload photo to auto-generate..."
                            className="block w-full rounded-xl border-border bg-white/50 px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary font-medium text-lg placeholder:text-muted-foreground/50"
                            required
                            disabled={isPublished && !isEditing}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="category" className="block text-sm font-semibold text-foreground">Category</label>
                            <input
                                list="categories"
                                type="text"
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="block w-full rounded-xl border-border bg-white/50 px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary"
                                required
                                disabled={isPublished && !isEditing}
                            />
                            <datalist id="categories">
                                {COMMON_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price" className="block text-sm font-semibold text-foreground">Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-muted-foreground font-bold">$</span>
                                <input
                                    type="number"
                                    id="price"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="block w-full rounded-xl border-border bg-white/50 pl-8 pr-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary font-bold"
                                    required
                                    disabled={isPublished && !isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-foreground">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="block w-full rounded-xl border-border bg-white/50 px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary leading-relaxed resize-none"
                            required
                            disabled={isPublished && !isEditing}
                        />
                    </div>

                    <div className="pt-2">
                        {isPublished && !isEditing ? (
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className="flex-1 bg-secondary text-foreground font-bold py-3 rounded-xl hover:bg-secondary/80 transition-colors"
                                    onClick={() => window.location.reload()} // Simple reset for demo
                                >
                                    List Another
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="flex-1 border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary/5 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={!title}
                                className={`
                                    w-full py-4 px-6 rounded-xl text-lg font-bold text-white shadow-lg transition-all duration-300
                                    ${!title
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30 hover:scale-[1.02]'}
                                `}
                            >
                                Publish Listing
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
